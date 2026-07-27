import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import data from './portfolioData.json';

const { personal, contact } = data;

export default function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', icon: 'home', label: 'HOME' },
    { to: '/about', icon: 'person_search', label: 'ABOUT THE AGENT' },
    { to: '/contact', icon: 'mail', label: 'GET IN TOUCH' },
  ];

  return (
    <div className="font-body-base text-on-surface crt-flicker">
      <div className="crt-overlay"></div>
      <div className="scanline"></div>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 lg:px-6 h-[56px] lg:h-[64px] bg-background-matte border-b-2 border-border-graphite shadow-[0_1px_0_0_rgba(255,182,147,0.1)]">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {sidebarOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link
            to="/"
            className="font-display-lg text-lg lg:text-xl font-black text-primary uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(255,176,0,0.4)] hover:text-primary-container transition-colors"
          >
            ARYAMAN
          </Link>
          <div className="h-5 w-px bg-border-graphite hidden md:block"></div>
          <div className="font-mono-data text-mono-data text-outline hidden md:block truncate">
            {personal.title.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="font-mono-data text-mono-data text-outline text-[10px] hidden xl:block">
            {time}
          </div>
          <div className="h-5 w-px bg-border-graphite hidden xl:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-led-green led-pulse-green rounded-full"></div>
            <span className="font-status-tiny text-status-tiny text-led-green hidden sm:inline">AVAILABLE</span>
          </div>
          <Link
            to="/contact"
            className="bevel-outset bg-primary text-on-primary px-3 lg:px-4 py-1.5 font-label-caps font-bold text-[10px] lg:text-[11px] hover:bg-primary-container active:translate-y-0.5 transition-all whitespace-nowrap"
          >
            START A PROJECT
          </Link>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-[56px] lg:top-[64px] bottom-0 w-56 flex flex-col z-40 bg-surface-dim border-r-2 border-border-graphite transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b-2 border-border-graphite bg-surface-container">
          <div className="font-status-tiny text-status-tiny text-outline mb-1">{personal.location.toUpperCase()}</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bevel-outset bg-surface-steel flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-lg">shield_person</span>
            </div>
            <div className="min-w-0">
              <div className="font-headline-md text-sm text-primary leading-tight font-bold truncate">{personal.name}</div>
              <div className="font-status-tiny text-status-tiny text-led-green">OPEN TO WORK</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 font-status-tiny text-status-tiny text-outline">SECTIONS</div>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 mx-2 my-0.5 transition-all ${
                isActive(link.to)
                  ? 'bg-primary-container text-on-primary-container border-l-2 border-primary'
                  : 'text-outline hover:bg-surface-container-highest hover:text-primary-fixed-dim border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              <span className="font-label-caps text-label-caps text-[11px]">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar CTA */}
        <div className="px-4 pb-3">
          <Link
            to="/contact"
            className="block text-center bevel-outset bg-primary text-on-primary py-2.5 font-label-caps font-bold text-[11px] hover:bg-primary-container active:translate-y-0.5 transition-all"
          >
            START A PROJECT
          </Link>
        </div>

        {/* Social links */}
        <div className="px-4 py-3 border-t border-border-graphite">
          <div className="font-status-tiny text-outline text-[9px] mb-2">FIND ME</div>
          <div className="flex gap-2">
            {[
              { icon: 'hub', href: `https://${contact.github}`, label: 'GitHub' },
              { icon: 'dns', href: `https://${contact.linkedin}`, label: 'LinkedIn' },
              { icon: 'mail', href: `mailto:${contact.email}`, label: 'Email' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.icon !== 'mail' ? '_blank' : undefined}
                rel={link.icon !== 'mail' ? 'noopener noreferrer' : undefined}
                className="flex-1 h-10 bevel-inset bg-background-matte flex flex-col items-center justify-center text-outline hover:text-primary transition-colors group"
                title={link.label}
              >
                <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">{link.icon}</span>
                <span className="font-status-tiny text-[7px] mt-0.5">{link.label.toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="p-4 border-t-2 border-border-graphite">
          <div className="font-mono-data text-mono-data text-outline text-[10px] leading-relaxed">
            <div>STACK: PYTHON / FASTAPI</div>
            <div>AI: CLAUDE + OPENAI API</div>
            <div className="text-primary-container mt-1">THIS SITE: REACT + VITE</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-56 mt-[56px] lg:mt-[64px] p-3 lg:p-4 h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)] overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
