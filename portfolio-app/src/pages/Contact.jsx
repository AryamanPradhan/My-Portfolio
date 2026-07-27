import React, { useState, useEffect, useRef } from 'react';
import DecryptText from '../components/DecryptText';
import data from '../portfolioData.json';

const { personal, contact, services } = data;

// Mirrors the caps enforced in api/_lib/validation.js. Kept in sync by hand —
// the server is the authority, this only spares people a pointless round trip.
const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 20, max: 4000 },
};

const EMAIL_RE = /^[^\s@,;:<>"'\\]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

function validate(form) {
  const errors = {};
  if (form.name.trim().length < LIMITS.name.min) {
    errors.name = 'Tell me who you are.';
  }
  if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'That does not look like a valid email.';
  }
  if (form.message.trim().length < LIMITS.message.min) {
    errors.message = `At least ${LIMITS.message.min} characters, please.`;
  }
  return errors;
}

function buildMailto(form) {
  const subject = `New project enquiry — ${form.name}${form.project ? ` (${form.project})` : ''}`;
  const body = [
    `Name: ${form.name}`,
    `Reply to: ${form.email}`,
    form.project ? `Project type: ${form.project}` : null,
    '',
    form.message,
  ].filter(Boolean).join('\n');
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', project: '', message: '' });
  // Honeypot. Hidden from people and from assistive tech, so anything that
  // fills it is a bot walking the DOM rather than reading the page.
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [log, setLog] = useState([]);
  const logRef = useRef(null);
  // Start of dwell time. A submission arriving seconds after the page rendered
  // did not come from someone who read it.
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const initLogs = [
      '[SYS] Contact terminal ready',
      '[NET] Secure channel open — transmissions relay straight to my inbox',
      '[SYS] Fill the form and hit transmit.',
      '[SYS] Awaiting input...',
    ];
    const timers = initLogs.map((line, i) =>
      setTimeout(() => setLog(prev => [...prev, line]), i * 300 + 200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const pushLog = (...lines) => setLog(prev => [...prev, ...lines]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      pushLog('[ERR] Payload rejected — check the highlighted fields.');
      return;
    }

    setStatus('sending');
    setNotice('');
    pushLog(`[TX] Encoding payload (${form.message.trim().length} chars)...`, '[TX] Transmitting...');

    try {
      // Without a deadline a stalled connection leaves the form disabled and
      // "TRANSMITTING..." forever, with no way back to the mailto fallback.
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          ...form,
          website,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (res.ok && payload.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', project: '', message: '' });
        setErrors({});
        pushLog('[TX] Acknowledged — message delivered.', '[SYS] I usually reply within a day.');
        return;
      }

      if (res.status === 400 && payload.errors) {
        setErrors(payload.errors);
        setStatus('idle');
        pushLog('[ERR] Payload rejected — check the highlighted fields.');
        return;
      }

      setStatus('error');
      setNotice(payload.error || 'Transmission failed.');
      pushLog(`[ERR] ${payload.error || 'Transmission failed.'}`);
    } catch (err) {
      // Network-level failure: offline, blocked, timed out, or function down.
      const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      const msg = timedOut ? 'The server took too long to respond.' : 'Could not reach the server.';
      setStatus('error');
      setNotice(msg);
      pushLog(`[ERR] ${msg}`, '[SYS] Fall back to your own mail client below.');
    }
  };

  const charCount = form.message.trim().length;
  const ready = Object.keys(validate(form)).length === 0;
  const sending = status === 'sending';

  return (
    <div className="h-full overflow-y-auto pr-2 page-enter">
      {/* Header */}
      <div className="bevel-outset bg-surface-dim px-4 lg:px-6 py-3 flex justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">settings_input_antenna</span>
          <DecryptText
            text="CONTACT TERMINAL"
            className="font-label-caps text-label-caps text-primary text-[11px]"
            speed={25}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-led-green led-pulse-green rounded-full"></div>
          <span className="font-status-tiny text-led-green text-[10px]">{personal.availability}</span>
        </div>
      </div>

      {/* CTA headline */}
      <div className="bevel-outset bg-surface-container-high p-5 lg:p-7 mb-4">
        <DecryptText
          text="LET'S BUILD THE THING THAT RUNS ITSELF"
          as="h1"
          className="font-display-lg text-2xl md:text-3xl lg:text-4xl font-black text-primary uppercase tracking-tight mb-3 drop-shadow-[0_0_15px_rgba(255,176,0,0.4)]"
          speed={20}
        />
        <p className="font-mono-data text-on-surface-variant text-[12px] lg:text-[13px] leading-relaxed max-w-2xl">
          Tell me the workflow your team is doing by hand — the one that eats a day a week. I'll come back
          with an honest read on whether it's worth automating, roughly what it would take, and what I'd
          build first. No pitch deck.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
              <span className="font-label-caps text-label-caps text-primary text-[10px]">START A CONVERSATION</span>
            </div>
            <div className="font-status-tiny text-outline text-[9px] mb-4">
              SENT STRAIGHT TO MY INBOX — YOUR ADDRESS IS USED ONLY TO REPLY, NEVER STORED OR SHARED
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Honeypot — off-screen, out of tab order, hidden from AT. */}
              <div aria-hidden="true" className="absolute w-px h-px -left-[9999px] overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">YOUR NAME</label>
                <input
                  type="text"
                  value={form.name}
                  maxLength={LIMITS.name.max}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Who's writing?"
                  className={`w-full px-3 py-2 text-[12px] ${errors.name ? 'border border-led-red' : ''}`}
                  aria-invalid={Boolean(errors.name)}
                  disabled={sending}
                />
                {errors.name && (
                  <div className="font-mono-data text-led-red text-[10px] mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">YOUR EMAIL</label>
                <input
                  type="email"
                  value={form.email}
                  maxLength={LIMITS.email.max}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="where I should reply"
                  className={`w-full px-3 py-2 text-[12px] ${errors.email ? 'border border-led-red' : ''}`}
                  aria-invalid={Boolean(errors.email)}
                  disabled={sending}
                />
                {errors.email && (
                  <div className="font-mono-data text-led-red text-[10px] mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">WHAT DO YOU NEED?</label>
                <div className="flex flex-wrap gap-1.5">
                  {services.map(s => (
                    <button
                      type="button"
                      key={s.name}
                      disabled={sending}
                      onClick={() => setForm(prev => ({ ...prev, project: prev.project === s.name ? '' : s.name }))}
                      className={`font-mono-data text-[10px] px-2 py-1 border transition-all disabled:opacity-50 ${
                        form.project === s.name
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-lowest text-on-surface-variant border-border-graphite/40 hover:text-primary'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">MESSAGE</label>
                <textarea
                  value={form.message}
                  maxLength={LIMITS.message.max}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="What are you trying to automate, and what does it cost you today?"
                  rows={6}
                  className={`w-full px-3 py-2 text-[12px] resize-none ${errors.message ? 'border border-led-red' : ''}`}
                  aria-invalid={Boolean(errors.message)}
                  disabled={sending}
                />
                {errors.message && (
                  <div className="font-mono-data text-led-red text-[10px] mt-1">{errors.message}</div>
                )}
              </div>

              <div className="bevel-inset bg-surface-container-lowest p-3 flex justify-between font-mono-data text-[10px]">
                <span className="text-outline">PAYLOAD</span>
                <span className={ready ? 'text-led-green' : 'text-outline'}>
                  {charCount}/{LIMITS.message.max} CHARS &nbsp;|&nbsp; {ready ? 'READY' : 'INCOMPLETE'}
                </span>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bevel-outset py-3 font-label-caps text-[12px] font-bold transition-all bg-primary text-on-primary hover:bg-primary-container active:translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
              >
                {sending ? 'TRANSMITTING...' : 'TRANSMIT'}
              </button>

              {status === 'sent' && (
                <div className="bevel-inset bg-led-green/5 p-3 text-center animate-fade-in">
                  <div className="font-mono-data text-led-green text-[11px]">
                    Message received. I'll get back to you.
                  </div>
                  <div className="font-mono-data text-on-surface-variant text-[10px] mt-1">
                    Usually within a day.
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="bevel-inset bg-led-red/5 p-3 animate-fade-in">
                  <div className="font-mono-data text-led-red text-[11px] mb-2">{notice}</div>
                  {/* The enquiry is not lost just because the API is: hand the
                      already-typed message to their own mail client. */}
                  <a
                    href={buildMailto(form)}
                    className="inline-block bevel-outset bg-surface-container-highest text-primary px-3 py-2 font-label-caps text-[10px] font-bold hover:text-primary-container"
                  >
                    OPEN IN MY MAIL APP INSTEAD
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Working details */}
          <div className="bevel-outset bg-surface-dim p-4">
            <div className="font-label-caps text-label-caps text-primary text-[10px] mb-3">WORKING DETAILS</div>
            <div className="space-y-2 font-mono-data text-[11px]">
              {[
                { label: 'BASED', value: personal.location, color: 'text-primary' },
                { label: 'WORKS WITH', value: personal.focus, color: 'text-primary-container' },
                { label: 'ENGAGEMENT', value: personal.engagement, color: 'text-on-surface-variant' },
                { label: 'BUILT IN', value: 'Python', color: 'text-primary' },
                { label: 'AVAILABILITY', value: 'Open to new work', color: 'text-led-green' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-3 border-b border-border-graphite/20 pb-1">
                  <span className="text-outline flex-shrink-0">{label}</span>
                  <span className={`${color} text-right`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct channels */}
          <div className="bevel-outset bg-surface-container-high p-4">
            <div className="font-label-caps text-label-caps text-outline text-[10px] mb-3">DIRECT CHANNELS</div>
            <div className="space-y-2">
              {[
                { icon: 'mail', label: 'EMAIL', value: contact.email, href: `mailto:${contact.email}` },
                { icon: 'hub', label: 'GITHUB', value: contact.github, href: `https://${contact.github}` },
                { icon: 'dns', label: 'LINKEDIN', value: contact.linkedin, href: `https://${contact.linkedin}` },
              ].map(({ icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={icon !== 'mail' ? '_blank' : undefined}
                  rel={icon !== 'mail' ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 bevel-inset bg-background-matte/40 px-3 py-2 hover:bg-surface-container-highest/40 transition-all group"
                >
                  <span className="material-symbols-outlined text-outline text-sm group-hover:text-primary transition-colors">{icon}</span>
                  <div className="min-w-0">
                    <div className="font-label-caps text-outline text-[9px] group-hover:text-primary transition-colors">{label}</div>
                    <div className="font-mono-data text-on-surface-variant text-[10px] group-hover:text-primary-container transition-colors truncate">{value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Log */}
          <div className="bevel-outset bg-background-matte flex-1 min-h-[160px] flex flex-col overflow-hidden">
            <div className="h-6 bg-surface-steel flex items-center px-3 border-b-2 border-border-graphite flex-shrink-0">
              <span className="font-label-caps text-label-caps text-outline text-[9px]">TERMINAL LOG</span>
              <div className="w-1.5 h-1.5 bg-led-green led-pulse-green rounded-full ml-auto"></div>
            </div>
            <div ref={logRef} className="flex-1 p-3 overflow-y-auto font-mono-data text-[10px] leading-relaxed">
              {log.map((line, i) => (
                <div key={i} className={
                  line.includes('[ERR]') ? 'text-led-red mb-0.5' :
                  line.includes('[NET]') ? 'text-led-green/80 mb-0.5' :
                  line.includes('[TX]') ? 'text-primary mb-0.5' :
                  'text-on-surface-variant mb-0.5'
                }>
                  {line}
                </div>
              ))}
              <span className="cursor-block mt-1"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
