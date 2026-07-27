/**
 * Server-side validation for contact submissions.
 *
 * Everything here re-checks what the browser already checked. Client-side
 * validation is a convenience for real people; it is not a control, because
 * anything can POST to this endpoint directly.
 */

// Caps chosen to be generous for a real enquiry and hostile to a payload bomb.
export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  project: { max: 60 },
  message: { min: 20, max: 4000 },
};

/** Largest JSON body we will even parse, in bytes. */
export const MAX_BODY_BYTES = 16 * 1024;

/**
 * Minimum time a human plausibly needs to read the form and write a message.
 * The browser reports this, so it is forgeable — it filters naive bots that
 * submit instantly, nothing more.
 */
export const MIN_ELAPSED_MS = 3000;

/** Beyond this the page was left open for a day; make them reload. */
export const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

/**
 * Deliberately conservative. Not RFC 5322 — that grammar accepts addresses no
 * mail provider will route. This accepts what real inboxes look like.
 */
const EMAIL_RE = /^[^\s@,;:<>"'\\]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/** The long tail is endless; these cover the overwhelming bulk of throwaways. */
const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com', '10minutemail.com', '20minutemail.com', 'anonbox.net',
  'burnermail.io', 'dispostable.com', 'emailondeck.com', 'fakeinbox.com',
  'getairmail.com', 'getnada.com', 'guerrillamail.com', 'guerrillamail.info',
  'harakirimail.com', 'inboxbear.com', 'jetable.org', 'mail-temporaire.fr',
  'mailcatch.com', 'maildrop.cc', 'mailinator.com', 'mailnesia.com',
  'mailsac.com', 'mintemail.com', 'mohmal.com', 'moakt.com',
  'mytemp.email', 'sharklasers.com', 'spam4.me', 'spamgourmet.com',
  'temp-mail.org', 'tempmail.com', 'tempmailo.com', 'tempinbox.com',
  'throwawaymail.com', 'trashmail.com', 'trbvm.com', 'tmpmail.org',
  'yopmail.com', 'yopmail.net', 'wegwerfmail.de', 'mailduck.io',
]);

/**
 * Strip C0/C1 control characters, keeping tab and newline.
 *
 * CR and LF are removed entirely from single-line fields by stripNewlines
 * below — they are the vector for SMTP header injection once a value is
 * interpolated into a Subject or Reply-To.
 */
function stripControlChars(value) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
}

function stripNewlines(value) {
  return value.replace(/[\r\n]+/g, ' ');
}

function asString(value) {
  return typeof value === 'string' ? value : '';
}

/**
 * Validate and normalise a submission.
 *
 * @returns {{ ok: true, data: object } | { ok: false, errors: Record<string,string> }}
 */
export function validateSubmission(body) {
  const errors = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: { _: 'Malformed request body.' } };
  }

  const name = stripNewlines(stripControlChars(asString(body.name))).trim();
  const email = stripNewlines(stripControlChars(asString(body.email))).trim().toLowerCase();
  const project = stripNewlines(stripControlChars(asString(body.project))).trim();
  const message = stripControlChars(asString(body.message)).trim();

  if (name.length < LIMITS.name.min) {
    errors.name = `Name must be at least ${LIMITS.name.min} characters.`;
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Name must be under ${LIMITS.name.max} characters.`;
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (email.length > LIMITS.email.max) {
    errors.email = `Email must be under ${LIMITS.email.max} characters.`;
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'That does not look like a valid email address.';
  } else if (DISPOSABLE_DOMAINS.has(email.slice(email.lastIndexOf('@') + 1))) {
    errors.email = 'Please use an address I can actually reply to.';
  }

  if (project.length > LIMITS.project.max) {
    errors.project = 'Unrecognised project type.';
  }

  if (message.length < LIMITS.message.min) {
    errors.message = `Tell me a bit more — at least ${LIMITS.message.min} characters.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Message must be under ${LIMITS.message.max} characters.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, data: { name, email, project, message } };
}

/**
 * Bot heuristics that must never surface a distinct error to the caller.
 *
 * A bot that learns *which* check caught it can iterate around it, so callers
 * are expected to answer these with the same success response a human gets.
 *
 * @returns {string|null} internal reason, or null if the submission looks human
 */
export function detectBot(body) {
  // Honeypot: a field hidden from humans and from assistive tech. Anything
  // that fills it is walking the DOM rather than reading the page.
  if (asString(body?.website).trim() !== '') return 'honeypot filled';

  // Convert only from types that cannot run caller code. Number() on an
  // arbitrary object invokes its valueOf/toString, which can throw — and a
  // throw here is an unhandled 500 rather than a rejected submission.
  const raw = body?.elapsedMs;
  const elapsed = typeof raw === 'number' ? raw
    : typeof raw === 'string' ? Number(raw)
    : NaN;
  if (!Number.isFinite(elapsed) || elapsed < 0) return 'missing timing signal';
  if (elapsed < MIN_ELAPSED_MS) return `submitted in ${elapsed}ms`;
  if (elapsed > MAX_ELAPSED_MS) return 'stale form';

  return null;
}
