/**
 * Transport-level defences: who is calling, from where, and how often.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Two windows stacked. The short one blunts a burst; the daily one stops a
 * patient attacker from trickling through the short window all day.
 */
const BURST = { tokens: 5, window: '1 h' };
const DAILY = { tokens: 15, window: '24 h' };

let limiters = null;

/**
 * Build the limiters once per warm instance.
 *
 * Returns null when Upstash is not configured. Callers must treat that as a
 * hard failure rather than an open door — an unmetered contact endpoint is a
 * spam relay, and the browser falls back to mailto so no enquiry is lost.
 */
function getLimiters() {
  if (limiters !== null) return limiters;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = Redis.fromEnv();
  limiters = {
    burst: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(BURST.tokens, BURST.window),
      prefix: 'contact:burst',
      analytics: false,
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(DAILY.tokens, DAILY.window),
      prefix: 'contact:daily',
      analytics: false,
    }),
  };
  return limiters;
}

/**
 * Best available client IP.
 *
 * On Vercel the platform appends the real client IP to x-forwarded-for, so the
 * first entry is the one to trust. Reading it from a raw socket instead would
 * yield the edge proxy for every visitor.
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).split(',')[0].trim();
  }
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.length > 0) return real.trim();
  return 'unknown';
}

/**
 * @returns {{ configured: boolean, allowed: boolean, retryAfter: number }}
 */
export async function checkRateLimit(ip) {
  const rl = getLimiters();
  if (!rl) return { configured: false, allowed: false, retryAfter: 0 };

  // Identify by IP. An unknown IP shares a single bucket, which is intentional:
  // if the platform ever stops giving us an IP, the whole endpoint throttles
  // rather than opening up.
  const [burst, daily] = await Promise.all([
    rl.burst.limit(ip),
    rl.daily.limit(ip),
  ]);

  const blocked = !burst.success || !daily.success;
  const reset = Math.max(burst.reset ?? 0, daily.reset ?? 0);
  const retryAfter = blocked ? Math.max(1, Math.ceil((reset - Date.now()) / 1000)) : 0;

  return { configured: true, allowed: !blocked, retryAfter };
}

/**
 * Allowed browser origins.
 *
 * ALLOWED_ORIGINS is a comma-separated env var for the custom domain. The
 * deployment's own URL and the Vite dev server are always permitted so preview
 * builds and local work keep functioning without extra configuration.
 */
function allowedOrigins() {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const origins = new Set(configured);

  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);

  if (process.env.VERCEL_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  return origins;
}

/**
 * Reject cross-site POSTs.
 *
 * Browsers set Origin on every POST and scripts cannot forge it, so this costs
 * nothing and turns away drive-by form spam aimed at the raw endpoint. A
 * missing Origin is refused rather than waved through — legitimate submissions
 * from the site always carry one.
 */
export function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (typeof origin !== 'string' || origin === '') return false;
  return allowedOrigins().has(origin.replace(/\/$/, ''));
}
