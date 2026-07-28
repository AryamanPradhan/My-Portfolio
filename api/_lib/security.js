/**
 * Transport-level defences: who is calling, from where, and how often.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Three windows stacked, narrowest first.
 *
 * The minute window only enforces spacing — on its own it would allow 1440
 * sends a day, so it is a companion to the hourly and daily ceilings, never a
 * replacement for them. The hourly window blunts a burst; the daily one stops a
 * patient attacker from trickling through the shorter windows all day.
 */
const MINUTE = { tokens: 1, window: '1 m' };
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
    minute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MINUTE.tokens, MINUTE.window),
      prefix: 'contact:minute',
      analytics: false,
    }),
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
  //
  // Narrowest window first, and in sequence rather than in parallel. Consuming
  // an hourly or daily token for a request the minute window already refused
  // would let rejected retries drain the longer budgets, locking someone out
  // for a day over one impatient afternoon.
  for (const window of [rl.minute, rl.burst, rl.daily]) {
    const result = await window.limit(ip);
    if (!result.success) {
      return {
        configured: true,
        allowed: false,
        retryAfter: Math.max(1, Math.ceil(((result.reset ?? 0) - Date.now()) / 1000)),
      };
    }
  }

  return { configured: true, allowed: true, retryAfter: 0 };
}

/**
 * Extra origins beyond the request's own host.
 *
 * ALLOWED_ORIGINS is a comma-separated env var, only needed when the page is
 * served from a different host than the API — which is not the case here.
 *
 * Note VERCEL_URL is the *deployment-specific* hostname
 * (my-portfolio-a1b2c3.vercel.app), not the production alias a visitor types.
 * VERCEL_PROJECT_PRODUCTION_URL is the stable one. Relying on VERCEL_URL alone
 * rejects every real visitor, so both are listed.
 */
function extraAllowedOrigins() {
  const origins = new Set(
    (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(o => o.trim().replace(/\/$/, '').toLowerCase())
      .filter(Boolean)
  );

  for (const host of [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
  ]) {
    if (host) origins.add(`https://${host}`.toLowerCase());
  }

  if (process.env.VERCEL_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  return origins;
}

/**
 * The host this request was actually addressed to.
 *
 * Vercel puts the visitor-facing hostname in x-forwarded-host; `host` alone can
 * be the internal one.
 */
function requestHost(req) {
  const forwarded = req.headers['x-forwarded-host'];
  if (typeof forwarded === 'string' && forwarded !== '') {
    return forwarded.split(',')[0].trim().toLowerCase();
  }
  const host = req.headers.host;
  return typeof host === 'string' ? host.trim().toLowerCase() : '';
}

/**
 * Reject cross-site POSTs.
 *
 * The test is same-origin: does the Origin the browser reported match the host
 * this request was addressed to? That holds on any domain — production alias,
 * preview deployment, custom domain, localhost — without configuration, which
 * an env-var allowlist does not.
 *
 * Browsers set Origin on cross-document POSTs and a page cannot forge either
 * header, so this turns away drive-by form spam. It was never a defence
 * against a non-browser client, which can send any headers it likes; that is
 * what the rate limit is for.
 *
 * A missing Origin is refused rather than waved through — submissions from the
 * site always carry one.
 */
export function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (typeof origin !== 'string' || origin === '') return false;

  let originHost;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  if (originHost === '') return false;

  if (originHost === requestHost(req)) return true;

  return extraAllowedOrigins().has(origin.replace(/\/$/, '').toLowerCase());
}
