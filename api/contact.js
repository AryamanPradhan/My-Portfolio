/**
 * POST /api/contact — receives a contact-form submission and emails it on.
 *
 * Layered, cheapest check first, so an abusive caller is turned away before it
 * costs anything: method → size → origin → rate limit → bot heuristics →
 * validation → delivery.
 */

import { validateSubmission, detectBot, MAX_BODY_BYTES } from './_lib/validation.js';
import { getClientIp, checkRateLimit, isAllowedOrigin } from './_lib/security.js';
import { deliverSubmission } from './_lib/mail.js';

/** Single generic failure string. Never leak which internal check tripped. */
const GENERIC_ERROR = 'Something went wrong on my end. Please email me directly.';

function send(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Every response is specific to one caller; never let a proxy cache it.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.json(payload);
}

/**
 * Vercel parses JSON bodies automatically, but only when the caller sets a
 * JSON content-type. Anything else arrives as a string or a Buffer.
 */
function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const declaredSize = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) {
    return send(res, 413, { ok: false, error: 'That message is too large.' });
  }

  // Browsers always send Origin on a cross-document POST and scripts cannot
  // forge it, so this cheaply rejects spam aimed straight at the endpoint.
  if (!isAllowedOrigin(req)) {
    return send(res, 403, { ok: false, error: 'Request rejected.' });
  }

  const ip = getClientIp(req);

  let limit;
  try {
    limit = await checkRateLimit(ip);
  } catch (err) {
    console.error('[contact] rate limit backend failed:', err);
    return send(res, 503, { ok: false, error: GENERIC_ERROR });
  }

  // Fail closed. An unmetered contact endpoint is a spam relay, and the form
  // falls back to mailto on any error, so no genuine enquiry is lost.
  if (!limit.configured) {
    console.error('[contact] Upstash env vars missing — refusing to accept submissions.');
    return send(res, 503, { ok: false, error: GENERIC_ERROR });
  }

  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return send(res, 429, {
      ok: false,
      error: "You've sent a few already — give it a little while, or email me directly.",
    });
  }

  const body = readBody(req);
  if (body === null) {
    return send(res, 400, { ok: false, error: 'Malformed request body.' });
  }

  // Answer bots with the same success response a human gets. A bot that learns
  // which heuristic caught it can iterate around it; one that thinks it
  // succeeded stops trying.
  const botReason = detectBot(body);
  if (botReason) {
    console.warn(`[contact] dropped submission from ${ip}: ${botReason}`);
    return send(res, 200, { ok: true });
  }

  const result = validateSubmission(body);
  if (!result.ok) {
    return send(res, 400, {
      ok: false,
      error: 'Please check the highlighted fields.',
      errors: result.errors,
    });
  }

  const delivery = await deliverSubmission(result.data, {
    ip,
    userAgent: String(req.headers['user-agent'] || ''),
    receivedAt: new Date(),
  });

  if (!delivery.ok) {
    // Log the real reason; return the generic one. Delivery failures expose
    // provider and configuration detail that is nobody else's business.
    console.error(`[contact] delivery failed: ${delivery.reason}`);
    return send(res, 502, { ok: false, error: GENERIC_ERROR });
  }

  return send(res, 200, { ok: true });
}
