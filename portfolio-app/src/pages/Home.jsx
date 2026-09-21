import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DecryptText from '../components/DecryptText';
import CtaBand from '../components/CtaBand';
import WorkflowDiagram from '../components/WorkflowDiagram';
import data from '../portfolioData.json';
import { slugify } from '../stackData';

const { personal, services, projects } = data;

const STATUS_STYLES = {
  SHIPPED: 'text-led-green bg-led-green/10 border border-led-green/30',
  'IN BUILD': 'text-primary bg-primary/10 border border-primary/30',
  INTERNAL: 'text-outline bg-surface-container-low border border-border-graphite/30',
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

export default function Home() {
  const [time, setTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));
  const [openProject, setOpenProject] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // A project can be opened by link (/#hotel-ai-guide). The Stack page sends
  // visitors here that way.
  useEffect(() => {
    const slug = location.hash.slice(1);
    if (slug) setOpenProject(projects.find(p => slugify(p.codename) === slug) ?? null);
  }, [location.hash]);

  const closeProject = () => {
    setOpenProject(null);
    if (location.hash) navigate('/', { replace: true });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeProject(); };
    if (openProject) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [openProject]);

  const activeCount = projects.filter(p => ['SHIPPED', 'IN BUILD'].includes(p.status)).length;

  const SPOTLIGHT_CODENAMES = ['AI ASSISTED ONBOARDING SYSTEM', 'HOTEL AI GUIDE'];
  const spotlightProjects = projects.filter(p => SPOTLIGHT_CODENAMES.includes(p.codename));
  const otherProjects = projects.filter(p => !SPOTLIGHT_CODENAMES.includes(p.codename));

  const summary = [
    { label: 'NAME', value: personal.name, color: 'text-primary' },
    { label: 'BUILDS', value: 'UNATTENDED SYSTEMS', color: 'text-primary-container' },
    { label: 'BASE', value: 'INDIA — REMOTE', color: 'text-on-surface-variant' },
    { label: 'STACK', value: 'PYTHON', color: 'text-primary-container' },
    { label: 'CLIENTS', value: 'AGENCIES', color: 'text-on-surface-variant' },
  ];

  return (
    <div className="h-full page-enter">

      {/* [&>*]:shrink-0 is load-bearing. This is a fixed-height flex column, so
          its children default to flex-shrink:1 and get compressed to fit rather
          than overflowing into the scroll. The hero carries overflow-hidden, so
          it was compressed to zero height and silently disappeared. */}
      <section className="h-full flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-2 [&>*]:shrink-0">

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
                        <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[op.status] || STATUS_STYLES.INTERNAL}`}>
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
                        <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[op.status] || STATUS_STYLES.INTERNAL}`}>
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

      {/* Retro window modal */}
      {openProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeProject}
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
                onClick={closeProject}
                className="bevel-outset bg-surface-container-lowest w-7 h-7 flex items-center justify-center text-led-red hover:bg-led-red hover:text-on-primary transition-colors font-mono-data font-bold text-[16px]"
              >
                X
              </button>
            </div>

            {/* Status bar */}
            <div className="bg-surface-dim border-x-2 border-border-graphite/60 px-4 py-1.5 flex items-center gap-3 flex-shrink-0">
              <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[openProject.status] || STATUS_STYLES.INTERNAL}`}>
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

              {(openProject.loom || openProject.live) && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border-graphite/40">
                  {openProject.live && (
                    <a
                      href={openProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bevel-outset bg-surface-container-highest text-primary px-4 py-2 font-label-caps text-[13px] hover:text-primary-container active:translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">language</span>
                      VIEW LIVE SITE
                    </a>
                  )}
                  {openProject.loom && (
                  <a
                    href={openProject.loom.replace('/embed/', '/share/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bevel-outset bg-surface-container-highest text-primary px-4 py-2 font-label-caps text-[13px] hover:text-primary-container active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    WATCH DEMO
                  </a>
                  )}
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="bevel-outset bg-surface-container-high px-4 py-2 flex items-center justify-between flex-shrink-0">
              <span className="font-mono-data text-outline text-[13px]">
                {openProject.tech.length} DEPS &nbsp;|&nbsp; {Object.keys(openProject.facts).length} FACTS &nbsp;|&nbsp; {openProject.outcomes.length} DECISIONS
              </span>
              <button
                onClick={closeProject}
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
