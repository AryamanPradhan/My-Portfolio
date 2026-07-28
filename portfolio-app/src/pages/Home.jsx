import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DecryptText from '../components/DecryptText';
import InteractiveTerminal from '../components/InteractiveTerminal';
import CtaBand from '../components/CtaBand';
import WorkflowDiagram from '../components/WorkflowDiagram';
import data from '../portfolioData.json';
import { TECH_ICONS } from '../techIcons';

const { personal, contact, services, stack, projects } = data;

const STATUS_STYLES = {
  ACTIVE: 'text-led-green bg-led-green/10 border border-led-green/30',
  RUNNING: 'text-led-green bg-led-green/10 border border-led-green/30',
  'IN BUILD': 'text-primary bg-primary/10 border border-primary/30',
  SHIPPED: 'text-primary-container bg-primary-container/10 border border-primary-container/30',
  COMPLETE: 'text-outline bg-surface-container-low border border-border-graphite/30',
};

const FACT_LABELS = {
  approvalGates: 'APPROVAL GATES',
  cronJobs: 'CRON JOBS',
  alwaysOnServers: 'ALWAYS-ON SERVERS',
  deployModel: 'DEPLOY MODEL',
  budgetCeiling: 'BUDGET CEILING',
  manualSteps: 'MANUAL STEPS',
  dataSource: 'DATA SOURCE',
};

const labelFor = (key) => FACT_LABELS[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();

const Sparkline = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
      <polygon fill={color} fillOpacity="0.15" points={`0,${height} ${points} ${width},${height}`} />
    </svg>
  );
};

export default function Home() {
  const [time, setTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));
  const [signalData, setSignalData] = useState(Array.from({ length: 20 }, () => Math.floor(Math.random() * 40) + 40));
  const [linkData, setLinkData] = useState(Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 30));
  const [openProject, setOpenProject] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      setSignalData(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 40 + (Math.random() > 0.8 ? 30 : 0)]);
      setLinkData(prev => [...prev.slice(1), Math.floor(Math.random() * 20) + 30 + (Math.random() > 0.9 ? 15 : 0)]);
    }, 800);
    return () => clearInterval(telemetryTimer);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setOpenProject(null); };
    if (openProject) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [openProject]);

  const activeCount = projects.filter(p => ['ACTIVE', 'RUNNING', 'IN BUILD'].includes(p.status)).length;

  const SPOTLIGHT_CODENAMES = ['AI ASSISTED ONBOARDING SYSTEM', 'SANDPIPER'];
  const spotlightProjects = projects.filter(p => SPOTLIGHT_CODENAMES.includes(p.codename));
  const otherProjects = projects.filter(p => !SPOTLIGHT_CODENAMES.includes(p.codename));

  const summary = [
    { label: 'NAME', value: personal.name, color: 'text-primary' },
    { label: 'BUILDS', value: 'UNATTENDED SYSTEMS', color: 'text-primary-container' },
    { label: 'BASE', value: 'INDIA — REMOTE', color: 'text-on-surface-variant' },
    { label: 'STACK', value: 'PYTHON', color: 'text-primary-container' },
    { label: 'CLIENTS', value: 'AGENCIES', color: 'text-on-surface-variant' },
    { label: 'STATUS', value: 'AVAILABLE', color: 'text-led-green' },
  ];

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 page-enter">

      {/* [&>*]:shrink-0 is load-bearing. This is a fixed-height flex column, so
          its children default to flex-shrink:1 and get compressed to fit rather
          than overflowing into the scroll. The hero carries overflow-hidden, so
          it was compressed to zero height and silently disappeared. */}
      <section className="lg:col-span-9 h-full flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-2 [&>*]:shrink-0">

        {/* Hero */}
        <div className="bevel-outset bg-surface-dim relative overflow-hidden">
          <div className="bg-led-red/20 border-b border-led-red/40 px-4 lg:px-6 py-1 flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-led-red tracking-widest">
              PERSONNEL FILE // OPEN FOR ENGAGEMENT
            </span>
            <span className="font-mono-data text-mono-data text-outline">{time}</span>
          </div>

          <div className="p-4 lg:p-8">
            <div className="font-mono-data text-mono-data text-outline mb-3">
              FILE TYPE: OPERATOR OVERVIEW &nbsp;|&nbsp; BUILDS: SYSTEMS THAT RUN UNATTENDED &nbsp;|&nbsp; ENGAGEMENT: {personal.engagement.toUpperCase()}
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="font-status-tiny text-status-tiny text-primary-container tracking-widest mb-2 animate-pulse">
                  &gt; FILE LOADED — {personal.availability}
                </div>
                <DecryptText
                  text={personal.name.toUpperCase()}
                  as="div"
                  className="font-mono-data text-primary-container text-[16px] lg:text-sm tracking-[0.3em] uppercase mb-3"
                  speed={40}
                />
                <h1 className="font-display-lg text-3xl md:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tighter leading-[1.05] mb-5 drop-shadow-[0_0_15px_rgba(255,176,0,0.4)] max-w-2xl">
                  {personal.headline}
                </h1>
                <p className="font-body-base text-on-surface-variant leading-relaxed mb-6 max-w-xl text-[16px] border-l-2 border-primary/40 pl-3">
                  {personal.subheadline}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="bevel-outset bg-primary text-on-primary px-5 py-2 font-label-caps font-bold text-[16px] hover:bg-primary-container active:translate-y-0.5 transition-all inline-block">
                    START A PROJECT
                  </Link>
                  <Link to="/about" className="bevel-outset bg-surface-container-highest text-primary px-5 py-2 font-label-caps font-bold text-[16px] hover:text-primary-container active:translate-y-0.5 transition-all border border-border-graphite inline-block">
                    ABOUT THE OPERATOR
                  </Link>
                </div>
              </div>

              {/* Fact card */}
              <div className="bevel-inset bg-background-matte/80 p-4 lg:p-5 w-full lg:w-64 flex-shrink-0">
                <div className="font-label-caps text-label-caps text-primary mb-3">AT A GLANCE</div>
                <div className="space-y-2 font-mono-data text-mono-data">
                  {summary.map(({ label, value, color }, i) => (
                    <div key={label} className={`flex justify-between gap-2 ${i < summary.length - 1 ? 'border-b border-border-graphite/30 pb-1' : ''}`}>
                      <span className="text-outline flex-shrink-0">{label}</span>
                      <span className={`${color} text-right`}>{value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-4 block text-center bevel-outset bg-surface-container-highest text-primary py-2 font-label-caps text-[13px] hover:text-primary-container transition-colors"
                >
                  EMAIL DIRECT
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">handyman</span>
            <span className="font-label-caps text-label-caps text-primary">WHAT I BUILD // SERVICES</span>
          </div>
          <div className="font-status-tiny text-outline text-[12px] mb-4">
            TYPICAL ENGAGEMENT: {personal.engagement.toUpperCase()} &nbsp;|&nbsp; FOCUS: {personal.focus.toUpperCase()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {services.map(service => (
              <div key={service.name} className="bevel-inset bg-background-matte/60 p-4">
                {/* No text-label-caps here: that token sets its own font-size
                    and is emitted after arbitrary values, so it would override
                    the 18px and leave the heading smaller than its own body. */}
                <div className="font-label-caps text-primary-container text-[18px] font-semibold leading-snug mb-2">{service.name}</div>
                <div className="font-body-base text-on-surface-variant text-[15px] leading-relaxed">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">database</span>
            <span className="font-label-caps text-label-caps text-primary">TECH STACK</span>
          </div>
          <div className="font-status-tiny text-outline text-[12px] mb-4">
            EVERYTHING BELOW IS HANDS-ON, NOT ASPIRATIONAL
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stack.map(group => (
              <div key={group.category} className="bevel-inset bg-background-matte/60 p-3">
                <div className="font-label-caps text-primary-container text-[13px] mb-2">{group.category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map(item => {
                    const icon = TECH_ICONS[item];
                    return (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 bg-surface-container-lowest text-on-surface-variant font-mono-data text-[13px] px-2 py-1 border border-border-graphite/30"
                      >
                        {/* Logos inherit currentColor rather than their brand
                            hex, so the chips stay inside the amber palette. The
                            official colour is kept in techIcons.js if that
                            should ever change. */}
                        {icon?.type === 'brand' && (
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 flex-shrink-0 fill-current text-primary-container">
                            <path d={icon.path} />
                          </svg>
                        )}
                        {icon?.type === 'symbol' && (
                          <span className="material-symbols-outlined text-primary-container flex-shrink-0 text-[16px] leading-none" aria-hidden="true">
                            {icon.name}
                          </span>
                        )}
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotlight Projects */}
        <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
          <div className="flex items-center justify-between mb-1 gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">star</span>
              <span className="font-label-caps text-label-caps text-primary">SPOTLIGHT PROJECTS</span>
            </div>
            <span className="font-mono-data text-outline text-[13px] hidden sm:block">{spotlightProjects.length} FILES</span>
          </div>
          <div className="font-status-tiny text-outline text-[12px] mb-4">
            FEATURED BUILDS &nbsp;|&nbsp; PRIMARY LANGUAGE: PYTHON
          </div>

          <div className="space-y-2">
            {spotlightProjects.map((op) => (
              <div key={op.codename} className="bevel-inset bg-background-matte/40 px-3 lg:px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-primary-container text-lg flex-shrink-0">star</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-data text-primary text-[16px] font-semibold min-w-0 break-words">{op.codename}</span>
                        <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[op.status] || STATUS_STYLES.COMPLETE}`}>
                          {op.status}
                        </span>
                        <span className="font-label-caps text-[12px] px-2 py-0.5 text-outline bg-surface-container-low border border-border-graphite/30 hidden sm:inline">
                          {op.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-mono-data text-on-surface-variant text-[14px] mt-1 line-clamp-1">
                        {op.brief || op.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenProject(op)}
                    className="bevel-outset bg-surface-container-highest text-primary px-3 py-1.5 font-label-caps text-[13px] hover:text-primary-container hover:bg-surface-container-high active:translate-y-0.5 transition-all flex-shrink-0 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    OPEN FILE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Projects */}
        <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
          <div className="flex items-center justify-between mb-1 gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">folder_special</span>
              <span className="font-label-caps text-label-caps text-primary">OTHER PROJECTS // BUILD LOG</span>
            </div>
            <span className="font-mono-data text-outline text-[13px] hidden sm:block">{otherProjects.length} FILES</span>
          </div>
          <div className="font-status-tiny text-outline text-[12px] mb-4">
            {otherProjects.length} BUILDS &nbsp;|&nbsp; {activeCount} LIVE OR IN BUILD &nbsp;|&nbsp; PRIMARY LANGUAGE: PYTHON
          </div>

          <div className="space-y-2">
            {otherProjects.map((op) => (
              <div key={op.codename} className="bevel-inset bg-background-matte/40 px-3 lg:px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-primary-container text-lg flex-shrink-0">folder_special</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-data text-primary text-[16px] font-semibold min-w-0 break-words">{op.codename}</span>
                        <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[op.status] || STATUS_STYLES.COMPLETE}`}>
                          {op.status}
                        </span>
                        <span className="font-label-caps text-[12px] px-2 py-0.5 text-outline bg-surface-container-low border border-border-graphite/30 hidden sm:inline">
                          {op.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-mono-data text-on-surface-variant text-[14px] mt-1 line-clamp-1">
                        {op.brief || op.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenProject(op)}
                    className="bevel-outset bg-surface-container-highest text-primary px-3 py-1.5 font-label-caps text-[13px] hover:text-primary-container hover:bg-surface-container-high active:translate-y-0.5 transition-all flex-shrink-0 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    OPEN FILE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <CtaBand
          heading="Got something that should be running itself?"
          sub="Tell me the workflow that eats your team's week. I'll tell you honestly whether automation is worth it — and what it would take to build."
        />
      </section>

      {/* Right sidebar */}
      <aside className="hidden lg:flex lg:col-span-3 h-full flex-col gap-3 overflow-hidden">
        <div className="bevel-outset bg-surface-dim p-3 flex-shrink-0">
          <div className="flex items-center gap-2 border-b border-border-graphite pb-2 mb-3">
            <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
            <span className="font-label-caps text-label-caps text-primary">SYSTEM TELEMETRY</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between font-mono-data text-mono-data mb-1">
                <span>SIGNAL</span>
                <span className="text-primary-container">{signalData[signalData.length - 1]}%</span>
              </div>
              <div className="bevel-inset bg-surface-container-lowest p-0.5">
                <Sparkline data={signalData} color="#EA6B1E" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-mono-data text-mono-data mb-1">
                <span>UPLINK</span>
                <span className="text-led-green">{linkData[linkData.length - 1]}%</span>
              </div>
              <div className="bevel-inset bg-surface-container-lowest p-0.5">
                <Sparkline data={linkData} color="#22C55E" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bevel-inset bg-surface-container-low p-2">
              <div className="font-status-tiny text-status-tiny text-outline">BUILDS</div>
              <div className="font-mono-data text-mono-data text-primary text-sm">{projects.length}</div>
            </div>
            <div className="bevel-inset bg-surface-container-low p-2">
              <div className="font-status-tiny text-status-tiny text-outline">ACTIVE</div>
              <div className="font-mono-data text-mono-data text-led-green text-sm">{activeCount}</div>
            </div>
          </div>
        </div>

        <Link
          to="/contact"
          className="bevel-outset bg-primary text-on-primary py-3 font-label-caps font-bold text-[16px] text-center hover:bg-primary-container active:translate-y-0.5 transition-all flex-shrink-0"
        >
          START A PROJECT
        </Link>

        <div className="bevel-outset bg-surface-container-high p-3 flex-shrink-0">
          <div className="font-label-caps text-label-caps text-outline mb-2">FIND ME</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { icon: 'hub', label: 'GITHUB', href: `https://${contact.github}`, color: 'text-primary-container' },
              { icon: 'dns', label: 'LINKEDIN', href: `https://${contact.linkedin}`, color: 'text-led-green' },
              { icon: 'mail', label: 'EMAIL', href: `mailto:${contact.email}`, color: 'text-primary' },
            ].map(asset => (
              <a
                key={asset.label}
                href={asset.href}
                target={asset.icon !== 'mail' ? '_blank' : undefined}
                rel={asset.icon !== 'mail' ? 'noopener noreferrer' : undefined}
                className={`h-12 bevel-inset bg-background-matte flex flex-col items-center justify-center ${asset.color} hover:text-primary transition-colors`}
              >
                <span className="material-symbols-outlined text-sm">{asset.icon}</span>
                <span className="font-status-tiny text-[12px] mt-0.5">{asset.label}</span>
              </a>
            ))}
          </div>
        </div>

        <InteractiveTerminal className="flex-1 min-h-0" />
      </aside>

      {/* Retro window modal */}
      {openProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpenProject(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <div
            className={`relative w-full max-h-[85vh] flex flex-col animate-slide-up ${openProject.workflow ? 'max-w-5xl' : 'max-w-3xl'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            <div className="bevel-outset bg-surface-container-high flex items-center justify-between px-4 py-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">folder_open</span>
                <span className="font-mono-data text-primary text-[16px] font-semibold">{openProject.codename}</span>
                <span className="font-mono-data text-outline text-[14px]">// {openProject.name}</span>
              </div>
              <button
                onClick={() => setOpenProject(null)}
                className="bevel-outset bg-surface-container-lowest w-7 h-7 flex items-center justify-center text-led-red hover:bg-led-red hover:text-on-primary transition-colors font-mono-data font-bold text-[16px]"
              >
                X
              </button>
            </div>

            {/* Status bar */}
            <div className="bg-surface-dim border-x-2 border-border-graphite/60 px-4 py-1.5 flex items-center gap-3 flex-shrink-0">
              <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[openProject.status] || STATUS_STYLES.COMPLETE}`}>
                {openProject.status}
              </span>
              <span className="font-label-caps text-[12px] px-2 py-0.5 text-outline bg-surface-container-low border border-border-graphite/30">
                {openProject.type.toUpperCase()}
              </span>
              <span className="font-mono-data text-outline text-[13px] ml-auto">{openProject.date}</span>
            </div>

            {/* Content */}
            <div className="bevel-inset bg-background-matte overflow-y-auto flex-1 p-4 lg:p-6 space-y-5">

              <div>
                <div className="font-label-caps text-primary text-[13px] mb-1.5">OBJECTIVE</div>
                <p className="font-body-base text-on-surface-variant text-[16px] leading-relaxed">{openProject.objective}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bevel-inset bg-surface-container-lowest p-3">
                  <div className="font-label-caps text-outline text-[12px] mb-2">BUILT WITH</div>
                  <div className="flex flex-wrap gap-1">
                    {openProject.tech.map(t => (
                      <span key={t} className="bg-surface-container-highest text-primary-fixed-dim font-mono-data text-[12px] px-1.5 py-0.5 border border-border-graphite/30">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bevel-inset bg-surface-container-lowest p-3">
                  <div className="font-label-caps text-outline text-[12px] mb-2">KEY FACTS</div>
                  <div className="space-y-1.5">
                    {Object.entries(openProject.facts).map(([key, val]) => (
                      // The value is the variable-length half, so it is the one
                      // allowed to wrap. It previously carried flex-shrink-0,
                      // which made long values like "Declines, never invents"
                      // push straight out of the panel in the narrow 3-column
                      // layout.
                      <div key={key} className="flex justify-between gap-2 font-mono-data text-[13px]">
                        <span className="text-on-surface-variant flex-shrink-0">{labelFor(key)}</span>
                        <span className="text-primary text-right min-w-0 break-words">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bevel-inset bg-surface-container-lowest p-3">
                  <div className="font-label-caps text-outline text-[12px] mb-2">DESIGN DECISIONS</div>
                  <div className="space-y-1.5">
                    {openProject.outcomes.map((outcome, j) => (
                      <div key={j} className="flex gap-1.5 font-body-base text-on-surface-variant text-[15px] leading-relaxed">
                        <span className="text-led-green flex-shrink-0">&#10003;</span>
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {openProject.workflow && (
                <div className="pt-3 border-t border-border-graphite/40">
                  <div className="font-label-caps text-primary text-[13px] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schema</span>
                    SYSTEM ARCHITECTURE
                  </div>
                  <WorkflowDiagram steps={openProject.workflow} codename={openProject.codename} />
                </div>
              )}

              {openProject.loom && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border-graphite/40">
                  <a
                    href={openProject.loom.replace('/embed/', '/share/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bevel-outset bg-surface-container-highest text-primary px-4 py-2 font-label-caps text-[13px] hover:text-primary-container active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    WATCH DEMO
                  </a>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="bevel-outset bg-surface-container-high px-4 py-2 flex items-center justify-between flex-shrink-0">
              <span className="font-mono-data text-outline text-[13px]">
                {openProject.tech.length} DEPS &nbsp;|&nbsp; {Object.keys(openProject.facts).length} FACTS &nbsp;|&nbsp; {openProject.outcomes.length} DECISIONS
              </span>
              <button
                onClick={() => setOpenProject(null)}
                className="font-label-caps text-outline text-[13px] hover:text-primary transition-colors"
              >
                [ESC] CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
