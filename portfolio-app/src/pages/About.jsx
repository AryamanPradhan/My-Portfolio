import React, { useState } from 'react';
import DecryptText from '../components/DecryptText';
import CtaBand from '../components/CtaBand';
import data from '../portfolioData.json';

const { personal, contact, principles, knowledgeBase, projects } = data;

export default function About() {
  const [revealed, setRevealed] = useState(new Set());

  const toggle = (id) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const reveal = (id, text) => (
    <span className={`redacted ${revealed.has(id) ? 'revealed' : ''}`} onClick={() => toggle(id)}>
      {text}
    </span>
  );

  return (
    <div className="h-full overflow-y-auto pr-2 page-enter">
      {/* Header */}
      <div className="bevel-outset bg-led-red/10 border-led-red/30 px-4 lg:px-6 py-2 flex justify-between items-center mb-4 gap-3">
        <span className="font-label-caps text-label-caps text-led-red text-[10px] lg:text-[11px] tracking-widest">
          ABOUT THE OPERATOR // {personal.name.toUpperCase()}
        </span>
        <span className="font-mono-data text-mono-data text-outline text-[10px] hidden sm:block flex-shrink-0">
          {personal.availability}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Identity */}
          <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">fingerprint</span>
              <span className="font-label-caps text-label-caps text-primary text-[11px]">IDENTITY</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-28 h-28 lg:w-32 lg:h-32 bevel-inset bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_person
                </span>
              </div>
              <div className="flex-1">
                <DecryptText
                  text={personal.name.toUpperCase()}
                  className="font-display-lg text-3xl lg:text-4xl font-black text-primary uppercase tracking-tighter block mb-1 drop-shadow-[0_0_15px_rgba(255,176,0,0.4)]"
                  as="h1"
                  speed={40}
                />
                <div className="font-headline-md text-base lg:text-lg text-primary-container font-bold tracking-wide mb-3">
                  {personal.title.toUpperCase()}
                </div>
                <p className="font-mono-data text-on-surface-variant text-[12px] leading-relaxed mb-4">
                  {personal.bio}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'BASED', value: personal.location, color: 'text-primary' },
                    { label: 'STATUS', value: 'AVAILABLE', color: 'text-led-green' },
                    { label: 'CLIENTS', value: personal.focus, color: 'text-primary-container' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bevel-inset bg-background-matte/60 p-2">
                      <div className="font-status-tiny text-outline text-[9px]">{label}</div>
                      <div className={`font-mono-data ${color} text-[11px] leading-snug`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Principles */}
          <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">rule</span>
              <span className="font-label-caps text-label-caps text-primary text-[11px]">OPERATING PRINCIPLES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {principles.map((p, i) => (
                <div key={i} className="flex gap-2 bevel-inset bg-background-matte/40 px-3 py-2.5">
                  <span className="text-led-green font-mono-data text-[11px] flex-shrink-0">▸</span>
                  <span className="font-mono-data text-on-surface-variant text-[11px] leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Working notes */}
          <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-led-red text-lg">visibility_off</span>
              <span className="font-label-caps text-label-caps text-led-red text-[11px]">WORKING NOTES // CLICK TO REVEAL</span>
            </div>
            <div className="font-mono-data text-on-surface-variant text-[12px] leading-loose">
              <p className="mb-3">
                Most automation work I see is assembled from {reveal('r1', 'no-code platforms billed per task run')}, which
                looks fast until the workflow needs real error handling. Everything I ship is {reveal('r2', 'hand-written Python calling APIs directly')} —
                slower to start, far cheaper and more controllable once it is running unattended.
              </p>
              <p className="mb-3">
                The failure mode I design against hardest is {reveal('r3', 'an AI system that confidently invents facts')}. So
                generated output carries {reveal('r4', 'a mandatory source URL on every claim')}, and anything customer-facing
                passes through {reveal('r5', 'a human approval gate before it goes out')}.
              </p>
              <p>
                On one client build I dropped an entire chat-bot approval layer late in design because a
                simpler {reveal('r6', 'checkbox inside the tool the client already opens daily')} did the same job — and removed
                the always-on server it would have required.
              </p>
              <div className="text-outline text-[10px] mt-4 italic">
                [ {revealed.size} of 6 revealed — click any highlighted block ]
              </div>
            </div>
          </div>

          {/* CTA */}
          <CtaBand
            heading="Want to see how this works on your problem?"
            sub="Send me the workflow you'd most like to stop doing by hand. I'll come back with an honest read on whether it's worth automating."
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bevel-outset bg-surface-dim p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-sm">inventory_2</span>
              <span className="font-label-caps text-label-caps text-primary text-[10px]">BUILD SUMMARY</span>
            </div>
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.codename} className="bevel-inset bg-background-matte/40 p-2.5">
                  <div className="font-mono-data text-primary-container text-[11px]">{p.codename}</div>
                  <div className="flex justify-between mt-1 gap-2">
                    <span className="font-status-tiny text-outline text-[9px] truncate">{p.type}</span>
                    <span className="font-status-tiny text-led-green text-[9px] flex-shrink-0">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bevel-outset bg-surface-container-high p-4">
            <div className="font-label-caps text-label-caps text-outline text-[10px] mb-3">KNOWLEDGE BASE</div>
            <div className="space-y-3">
              {knowledgeBase.map(kb => (
                <div key={kb.name}>
                  <div className="font-mono-data text-primary text-[11px] mb-0.5">{kb.name}</div>
                  <p className="font-mono-data text-on-surface-variant text-[10px] leading-relaxed">{kb.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bevel-outset bg-surface-dim p-4">
            <div className="font-label-caps text-label-caps text-primary text-[10px] mb-2">ENGAGEMENT</div>
            <p className="font-mono-data text-on-surface-variant text-[10px] leading-relaxed mb-3">
              {personal.engagement}. Currently taking on new work with {personal.focus.toLowerCase()}.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="block text-center bevel-outset bg-primary text-on-primary py-2 font-label-caps text-[11px] font-bold hover:bg-primary-container transition-colors break-all"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
