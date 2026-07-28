/**
 * Transport-level defences: who is calling, from where, and how often.
 */

/**
 * Three sliding windows stacked, narrowest first.
 *
 * The minute window only enforces spacing — on its own it would allow 1440
 * sends a day, so it is a companion to the hourly and daily ceilings, never a
 * replacement for them. The hourly window blunts a burst; the daily one stops a
 * patient sender trickling through the shorter windows all day.
 */
const WINDOWS = [
  { tokens: 1, ms: 60_000 },
  { tokens: 5, ms: 60 * 60_000 },
  { tokens: 15, ms: 24 * 60 * 60_000 },
];

const LONGEST_MS = Math.max(...WINDOWS.map(w => w.ms));

/**
 * Counters live in the instance's memory, not in Redis.
 *
 * Be honest about what that buys. A serverless instance is not a shared,
 * durable store: each one keeps its own map, Vercel may run several at once,
 * and a cold start wipes the lot. So these limits hold against an impatient
 * visitor and against casual scripted abuse hitting a warm instance, and they
 * do not hold against someone patient enough to wait out a cold start or lucky
 * enough to be balanced onto a fresh instance.
 *
 * That is the accepted trade for having no external dependency. The honeypot,
 * timing gate, origin check and validation all still apply, and none of them
 * cap volume — this is the only thing that does.
 *
 * ip -> ascending array of hit timestamps in ms
 */
const hits = new Map();

/** Stop a long-lived warm instance accumulating IPs forever. */
const MAX_TRACKED_IPS = 5000;

function sweep(now) {
  for (const [ip, times] of hits) {
    const live = times.filter(t => now - t < LONGEST_MS);
    if (live.length === 0) hits.delete(ip);
    else hits.set(ip, live);
  }
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
 * Identify by IP. An unknown IP shares a single bucket, which is intentional:
 * if the platform ever stops giving us one, the whole endpoint throttles rather
 * than opening up.
 *
 * @returns {{ allowed: boolean, retryAfter: number }}
 */
export function checkRateLimit(ip) {
  const now = Date.now();

  if (hits.size > MAX_TRACKED_IPS) sweep(now);

  const times = (hits.get(ip) || []).filter(t => now - t < LONGEST_MS);

  // Narrowest window first. A refused request is not recorded at all, so
  // retrying against a closed minute window cannot quietly drain the hourly or
  // daily budget and lock someone out for a day over one impatient afternoon.
  for (const w of WINDOWS) {
    const inWindow = times.filter(t => now - t < w.ms);
    if (inWindow.length >= w.tokens) {
      const oldest = inWindow[0];
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((oldest + w.ms - now) / 1000)),
      };
    }
  }

  times.push(now);
  hits.set(ip, times);
  return { allowed: true, retryAfter: 0 };
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
