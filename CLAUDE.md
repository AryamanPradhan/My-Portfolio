# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site themed as a retro-industrial "classified intelligence dossier / engineering workstation" OS interface. Dark amber monochrome aesthetic with CRT effects, bevel borders, LED indicators, and terminal-style elements.

## Tech Stack

- **React 19** SPA (not Next.js, no SSR)
- **Vite 8** build tool with `@vitejs/plugin-react`
- **React Router DOM 7** for client-side routing (`BrowserRouter`)
- **Tailwind CSS 3** with class-based dark mode (permanently dark via `<body class="dark">`)
- **TypeScript** installed for type-checking only (`tsc && vite build`); all source files are `.jsx`, not `.tsx`
- **Google Fonts** loaded via CDN in index.html: IBM Plex Mono and IBM Plex Sans, plus Material Symbols Outlined icons
- **Vercel serverless functions** (Node, ESM) in `api/` for the contact form — Resend for delivery; rate limiting is in-process with no external store

## Commands

Frontend commands run from `portfolio-app/`:

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Type-check (tsc) then bundle for production
npm run preview  # Serve production build locally
```

The API's dependencies live in the **root** `package.json`, separate from the app's:

```bash
npm install      # From repo root — installs API deps only
vercel dev       # From repo root — serves the app AND the api/ functions
```

`npm run dev` alone does not serve `api/` — the contact form will fail its fetch
and fall back to `mailto:`. Use `vercel dev` to exercise the real endpoint.

No test runner, linter, or formatter is configured.

## Architecture

```
portfolio-app/           # The React application (Vercel builds this)
  src/
    main.jsx             # Mount point (renders into #app)
    App.jsx              # BrowserRouter with route definitions
    Layout.jsx           # Persistent shell: top nav bar, left side nav, <Outlet/>
    index.css            # Tailwind directives + custom CSS (CRT overlay, bevel effects, LED animations, scrollbars)
    portfolioData.json   # Site content: personal, contact, services, projects
    pages/               # Home.jsx, About.jsx, Contact.jsx
    components/          # BootScreen, CtaBand, DecryptText, InteractiveTerminal, WorkflowDiagram
    assets/              # Static images (hero.png, SVGs)
  public/
    icons.svg            # SVG sprite sheet (social icons: bluesky, discord, github, x)

api/                     # Vercel serverless functions (root package.json owns their deps)
  contact.js             # POST /api/contact — the only endpoint
  _lib/                  # Underscore prefix keeps these out of the route table
    validation.js        # Field validation, sanitisation, bot heuristics
    security.js          # Same-origin check, client IP, in-memory rate limiter
    mail.js              # Resend delivery

vercel.json              # Build commands, SPA rewrites, asset caching
.env.example             # Template for the API's environment variables
apply_palette.py         # Helper to update palette in design reference files
download_screens.py      # Helper to download design reference screens
```

## Routing

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home` | Dashboard; projects live here |
| `/about` | `About` | Operator profile |
| `/contact` | `Contact` | Contact form |
| `/profile` | — | Redirects to `/about` |
| `/projects` | — | Redirects to `/` |
| `*` | — | Redirects to `/` |

Routing is client-side, so `vercel.json` rewrites everything except `/api/*`
to `index.html`. Changing that rewrite will 404 direct loads of `/about`.

## Contact API

`POST /api/contact` accepts `{ name, email, project, message, website, elapsedMs }`
and emails the submission on. Checks run cheapest-first and each has a reason:

| Layer | Behaviour |
|-------|-----------|
| Same-origin check | The `Origin` header must match the host the request was addressed to (`x-forwarded-host`). Works on any domain with no config; `ALLOWED_ORIGINS` is an optional extra |
| Body size cap | 16 KB, refused before parsing |
| Rate limit | 1/minute, 5/hour and 15/day per IP, counted in the function's own memory. Narrowest window first, and a refused request is not recorded, so retries cannot drain a longer window's budget. **Per-instance and lost on cold start** — this stops impatient visitors and casual scripted abuse, not a patient attacker |
| Honeypot | `website` field, hidden off-screen; filled means bot |
| Timing | Rejects submissions under 3s or over 24h after page load |
| Validation | Length caps, email shape, disposable-domain blocklist, control-char and CRLF stripping (SMTP header injection) |

Bot detections return **200 with a success body**, deliberately: a bot that
learns which check caught it can iterate around it. Genuine failures return one
generic message and log the real reason server-side.

Environment variables are documented in `.env.example`. None may carry a `VITE_`
prefix — that ships the value to the browser.

## Design System

The Tailwind config (`tailwind.config.js`) defines an extensive custom color palette with Material Design 3-inspired tokens: `primary`, `on-primary`, `surface-dim`, `surface-container-high`, `led-green`, `led-red`, `border-graphite`, `background-matte`, `surface-steel`, `terminal-dim`, etc.

Custom CSS classes used throughout the JSX (defined in `index.css` or needing to be ported from `stitch_screens/` references):
- `bevel-outset` / `bevel-inset` — industrial raised/inset border effects
- `crt-overlay` — CRT scanline effect overlay
- `led-pulse-green` — LED pulsing animation
- Custom font utilities (`font-body-base`, `font-display-lg`, `font-mono-data`, `font-label-caps`, `font-status-tiny`) mapping to IBM Plex families

## Key Patterns

- **All styling is Tailwind utility classes** inline in JSX — no CSS modules or styled-components
- **State is local React hooks only** (`useState`, `useEffect`) — no external state management
- **One network call in the whole app**: the contact form's POST. Everything else is static content from `portfolioData.json` or hardcoded in JSX
- **The contact form degrades to `mailto:`** on any API failure, so a broken or unconfigured backend never costs an enquiry. Preserve that fallback when touching `Contact.jsx`
- **Client-side validation is a courtesy, not a control** — `api/_lib/validation.js` is the authority. The two sets of limits are kept in sync by hand
- **The site is silent** — there is no audio anywhere, by choice
