import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import data from './portfolioData.json';
import { GreeterBot, PaintedName } from './components/Bots';

const { personal, contact } = data;

export default function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', icon: 'home', label: 'HOME' },
    { to: '/about', icon: 'person_search', label: 'ABOUT' },
    { to: '/stack', icon: 'layers', label: 'STACK' },
    { to: '/contact', icon: 'mail', label: 'CONTACT' },
  ];

  const socialLinks = [
    { icon: 'dns', href: `https://${contact.linkedin}`, label: 'LinkedIn' },
    { icon: 'mail', href: `mailto:${contact.email}`, label: 'Email' },
  ];

  return (
    <div className="font-body-base text-on-surface crt-flicker">
      <div className="crt-overlay"></div>
      <div className="scanline"></div>

      {/* Header: the site's only navigation, so pages get the full width.
          Equal outer grid tracks keep the nav centred on the page, whatever
          the logo and the call to action measure. */}
      <nav className="fixed top-0 w-full z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:px-6 h-[56px] lg:h-[64px] bg-background-matte border-b-2 border-border-graphite shadow-[0_1px_0_0_rgba(255,182,147,0.1)]">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0 h-full">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Two small robots painting the name; the margins make room for them. */}
          <PaintedName className="sm:mr-11 lg:mr-0 xl:ml-8 xl:mr-11">
            <Link
              to="/"
              className="block font-display-lg text-lg lg:text-xl font-black text-primary uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(255,176,0,0.4)] hover:text-primary-container transition-colors"
            >
              ARYAMAN
            </Link>
          </PaintedName>
          <div className="h-5 w-px bg-border-graphite hidden xl:block"></div>
          <div className="font-mono-data text-mono-data text-outline hidden xl:block truncate">
            {personal.title.toUpperCase()}
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-stretch h-full">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 xl:px-4 border-b-2 -mb-[2px] transition-colors ${
                isActive(link.to)
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-outline hover:text-primary-fixed-dim hover:bg-surface-container-highest'
              }`}
            >
              {/* Icons only from xl: at lg the four links plus both sides of
                  the header are too wide to stay centred with them. */}
              <span className="material-symbols-outlined text-lg hidden xl:inline">{link.icon}</span>
              <span className="font-label-caps text-label-caps whitespace-nowrap">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="col-start-3 justify-self-end flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-led-green led-pulse-green rounded-full"></div>
            <span className="font-status-tiny text-status-tiny text-led-green hidden sm:inline">AVAILABLE</span>
          </div>
          <Link
            to="/contact"
            className="bevel-outset bg-primary text-on-primary px-3 lg:px-4 py-1.5 font-label-caps font-bold text-[13px] lg:text-[14px] hover:bg-primary-container active:translate-y-0.5 transition-all whitespace-nowrap"
          >
            {/* The full label plus the wordmark overruns a 320px viewport. The
                closing band on each page still carries the full call to action. */}
            <span className="hidden min-[380px]:inline">START A PROJECT</span>
            <span className="min-[380px]:hidden">CONTACT</span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu: drops down under the header */}
      {menuOpen && (
        <>
          <div className="mobile-menu-overlay lg:hidden" onClick={() => setMenuOpen(false)}></div>
          <div className="lg:hidden fixed top-[56px] left-0 right-0 z-40 bg-surface-dim border-b-2 border-border-graphite">
            <nav className="py-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 my-0.5 transition-all ${
                    isActive(link.to)
                      ? 'bg-primary-container text-on-primary-container border-l-2 border-primary'
                      : 'text-outline hover:bg-surface-container-highest hover:text-primary-fixed-dim border-l-2 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                  <span className="font-label-caps text-label-caps">{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-border-graphite">
              <div className="font-status-tiny text-outline text-[12px] mb-2">FIND ME</div>
              <div className="flex gap-2">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.icon !== 'mail' ? '_blank' : undefined}
                    rel={link.icon !== 'mail' ? 'noopener noreferrer' : undefined}
                    className="flex-1 h-10 bevel-inset bg-background-matte flex flex-col items-center justify-center text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">{link.icon}</span>
                    <span className="font-status-tiny text-[12px] mt-0.5">{link.label.toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <GreeterBot phosphor={location.pathname === '/stack'} />

      {/* Main Content */}
      <main className="mt-[56px] lg:mt-[64px] p-3 lg:p-4 h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)] overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
