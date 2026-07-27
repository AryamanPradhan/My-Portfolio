import React, { useState, useEffect, useRef } from 'react';
import DecryptText from '../components/DecryptText';
import data from '../portfolioData.json';

const { personal, contact, services } = data;

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', project: '', message: '' });
  const [opened, setOpened] = useState(false);
  const [log, setLog] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    const initLogs = [
      '[SYS] Contact terminal ready',
      `[NET] Route: mail client → ${contact.email}`,
      '[SYS] Fill the form and hit transmit — it opens your mail app with the message drafted.',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    const subject = `New project enquiry — ${form.name}${form.project ? ` (${form.project})` : ''}`;
    const body = [
      `Name: ${form.name}`,
      `Reply to: ${form.email}`,
      form.project ? `Project type: ${form.project}` : null,
      '',
      form.message,
    ].filter(Boolean).join('\n');

    setLog(prev => [
      ...prev,
      `[TX] Composing message (${form.message.length} chars)...`,
      '[TX] Handing off to your mail client.',
      '[SYS] If nothing opened, email directly — address is on the right.',
    ]);
    setOpened(true);

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const ready = form.name && form.email && form.message;

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
              THIS DRAFTS AN EMAIL IN YOUR OWN MAIL APP — NOTHING IS SENT FROM THIS PAGE
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">YOUR NAME</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Who's writing?"
                  className="w-full px-3 py-2 text-[12px]"
                  required
                />
              </div>
              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">YOUR EMAIL</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="where I should reply"
                  className="w-full px-3 py-2 text-[12px]"
                  required
                />
              </div>
              <div>
                <label className="font-label-caps text-outline text-[10px] block mb-1.5">WHAT DO YOU NEED?</label>
                <div className="flex flex-wrap gap-1.5">
                  {services.map(s => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => setForm(prev => ({ ...prev, project: prev.project === s.name ? '' : s.name }))}
                      className={`font-mono-data text-[10px] px-2 py-1 border transition-all ${
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
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="What are you trying to automate, and what does it cost you today?"
                  rows={6}
                  className="w-full px-3 py-2 text-[12px] resize-none"
                  required
                />
              </div>

              <div className="bevel-inset bg-surface-container-lowest p-3 flex justify-between font-mono-data text-[10px]">
                <span className="text-outline">PAYLOAD</span>
                <span className={ready ? 'text-led-green' : 'text-outline'}>
                  {form.message.length} CHARS &nbsp;|&nbsp; {ready ? 'READY' : 'INCOMPLETE'}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bevel-outset py-3 font-label-caps text-[12px] font-bold transition-all bg-primary text-on-primary hover:bg-primary-container active:translate-y-0.5"
              >
                TRANSMIT
              </button>

              {opened && (
                <div className="bevel-inset bg-led-green/5 p-3 text-center animate-fade-in">
                  <div className="font-mono-data text-led-green text-[11px]">
                    Your mail app should have opened with the message drafted.
                  </div>
                  <div className="font-mono-data text-on-surface-variant text-[10px] mt-1">
                    If it didn't, email {contact.email} directly.
                  </div>
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
