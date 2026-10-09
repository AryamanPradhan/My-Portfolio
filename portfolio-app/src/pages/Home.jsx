import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CtaBand from '../components/CtaBand';
import WorkflowDiagram from '../components/WorkflowDiagram';
import { RepairBot } from '../components/Bots';
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

function ProjectRow({ project, icon, onOpen }) {
  // This site's own file is "under repair": a robot fixing its button. On
  // phones the button drops to its own line so the robot has room beside it.
  const repair = project.codename === 'ARYAMAN_OS';
  return (
    <div
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project); } }}
      className="bevel-inset bg-background-matte/40 px-3 lg:px-4 py-3 cursor-pointer hover:bg-surface-container-high/40 transition-colors"
    >
      <div className={`flex items-center justify-between gap-3 ${repair ? 'flex-wrap sm:flex-nowrap' : ''}`}>
        <div className={`flex items-center gap-3 min-w-0 ${repair ? 'basis-full sm:basis-auto' : ''}`}>
          <span className="material-symbols-outlined text-primary-container text-lg flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            {/* The readable name leads; the codename is one more tag beside the
                status, so a visitor reads what the build does before its label. */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-data text-primary text-[16px] font-semibold min-w-0 break-words">{project.name}</span>
              <span className={`font-label-caps text-[12px] px-2 py-0.5 ${STATUS_STYLES[project.status] || STATUS_STYLES.INTERNAL}`}>
                {project.status}
              </span>
              <span className="font-label-caps text-[12px] px-2 py-0.5 text-outline bg-surface-container-low border border-border-graphite/30 hidden sm:inline">
                {project.type.toUpperCase()}
              </span>
              <span className="font-mono-data text-[12px] px-2 py-0.5 text-outline border border-border-graphite/20 hidden lg:inline">
                {project.codename}
              </span>
            </div>
            <div className="font-mono-data text-on-surface-variant text-[14px] mt-1 line-clamp-2">
              {project.brief || project.type}
            </div>
          </div>
        </div>
        {/* Purely cosmetic; the button works as normal. The margin keeps room
            for the robot where the row is tight. */}
        <div className={`relative flex-shrink-0 ${repair ? 'ml-auto sm:ml-12 lg:ml-0' : ''}`}>
          {repair && <RepairBot />}
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(project); }}
            className="bevel-outset bg-surface-container-highest text-primary px-3 py-1.5 font-label-caps text-[13px] hover:text-primary-container hover:bg-surface-container-high active:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            VIEW PROJECT
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectPanel({ icon, title, subtitle, projects, onOpen }) {
  return (
    <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
      <div className="flex items-center justify-between mb-1 gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
          <span className="font-label-caps text-label-caps text-primary">{title}</span>
        </div>
        <span className="font-mono-data text-outline text-[13px] hidden sm:block">{projects.length} PROJECTS</span>
      </div>
      <div className="font-status-tiny text-outline text-[12px] mb-4">{subtitle}</div>
      <div className="space-y-2">
        {projects.map((p) => <ProjectRow key={p.codename} project={p} icon={icon} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // The URL is the only record of which project is open: /#hotel-ai-guide.
  // Opening one is a navigation, so Back closes it rather than leaving the
  // site, and a visitor can send someone a link to the project itself.
  const openProject = projects.find(p => slugify(p.codename) === location.hash.slice(1)) ?? null;

  const openProjectByHash = (p) => navigate(`/#${slugify(p.codename)}`);
  const closeProject = () => navigate('/', { replace: true });

  useEffect(() => {
    if (!openProject) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeProject(); };
    document.addEventListener('keydown', handleEsc);
    // The page scrolls now, so without this the content slides around
    // behind the modal.
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [openProject]);

  const activeCount = projects.filter(p => ['SHIPPED', 'IN BUILD'].includes(p.status)).length;

  // Order here is the order on the page, not the order in portfolioData.json.
  const SPOTLIGHT_CODENAMES = ['SPEED-TO-LEAD', 'AI ASSISTED ONBOARDING SYSTEM', 'HOTEL AI GUIDE'];
  const spotlightProjects = SPOTLIGHT_CODENAMES
    .map(c => projects.find(p => p.codename === c))
    .filter(Boolean);
  const otherProjects = projects.filter(p => !SPOTLIGHT_CODENAMES.includes(p.codename));

  const summary = [
    { label: 'NAME', value: personal.name, color: 'text-primary' },
    { label: 'BUILDS', value: 'UNATTENDED SYSTEMS', color: 'text-primary-container' },
    { label: 'BASE', value: 'INDIA — REMOTE', color: 'text-on-surface-variant' },
    { label: 'STACK', value: 'PYTHON', color: 'text-primary-container' },
    { label: 'CLIENTS', value: 'SMALL & MEDIUM BUSINESSES', color: 'text-on-surface-variant' },
  ];

  return (
    <div className="page-enter">

      <section className="flex flex-col gap-4">

        {/* Hero */}
        <div className="bevel-outset bg-surface-dim relative overflow-hidden">
          <div className="p-4 lg:p-8">
            {/* Three columns from xl, two at lg, stacked below. The left column
                used to be flex-1 with everything inside it capped at max-w-xl,
                which left a dead band between the copy and the fact card on any
                wide screen. The shipped-builds list now occupies that width
                instead of sitting underneath the copy. */}
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">

              <div className="flex-1 min-w-0 w-full">
                <h1 className="font-display-lg text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-[1.1] mb-5">
                  {personal.headline}
                </h1>
                <p className="font-body-base text-on-surface-variant leading-relaxed mb-6 max-w-2xl text-[16px] border-l-2 border-primary/40 pl-3">
                  {personal.subheadline}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="bevel-outset bg-primary text-on-primary px-5 py-2 font-label-caps font-bold text-[16px] hover:bg-primary-container active:translate-y-0.5 transition-all inline-block">
                    Start a project
                  </Link>
                  <Link to="/about" className="bevel-outset bg-surface-container-highest text-primary px-5 py-2 font-label-caps font-bold text-[16px] hover:text-primary-container active:translate-y-0.5 transition-all border border-border-graphite inline-block">
                    About me
                  </Link>
                </div>
              </div>

              {/* Side by side from xl, stacked into one column at lg. */}
              <div className="w-full lg:w-72 xl:w-auto flex-shrink-0 flex flex-col xl:flex-row gap-4 xl:gap-6">

                {/* What I build, in the hero rather than in a panel further
                    down: it answers "can this person do my thing?" while the
                    headline is still on screen. */}
                <div className="xl:w-[21rem] flex-shrink-0">
                  <div className="font-label-caps text-label-caps text-primary mb-3">WHAT I BUILD</div>
                  <div className="space-y-2">
                    {services.map(service => (
                      <div key={service.name} className="bevel-inset bg-background-matte/60 px-3 py-2">
                        <span className="font-mono-data text-primary text-[14px] font-semibold">{service.name}</span>
                        <span className="block font-body-base text-on-surface-variant text-[13px] leading-snug mt-0.5">{service.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fact card */}
                <div className="bevel-inset bg-background-matte/80 p-4 lg:p-5 w-full xl:w-64 flex-shrink-0 self-start">
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
        </div>

        <ProjectPanel
          icon="star"
          title="SPOTLIGHT PROJECTS"
          subtitle={<>FEATURED BUILDS &nbsp;|&nbsp; PRIMARY LANGUAGE: PYTHON</>}
          projects={spotlightProjects}
          onOpen={openProjectByHash}
        />

        <ProjectPanel
          icon="folder_special"
          title="MORE WORK"
          subtitle={<>{otherProjects.length} BUILDS &nbsp;|&nbsp; {activeCount} LIVE OR IN BUILD &nbsp;|&nbsp; PRIMARY LANGUAGE: PYTHON</>}
          projects={otherProjects}
          onOpen={openProjectByHash}
        />

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
            className={`relative w-full max-h-[85dvh] flex flex-col animate-slide-up ${openProject.workflow ? 'max-w-5xl' : 'max-w-3xl'}`}
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
              <span />
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
