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

## Commands

All commands run from `portfolio-app/`:

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Type-check (tsc) then bundle for production
npm run preview  # Serve production build locally
```

No test runner, linter, or formatter is configured.

## Architecture

```
portfolio-app/           # The React application
  src/
    main.jsx             # Mount point (renders into #app)
    App.jsx              # BrowserRouter with route definitions
    Layout.jsx           # Persistent shell: top nav bar, left side nav, <Outlet/>
    index.css            # Tailwind directives + custom CSS (CRT overlay, bevel effects, LED animations, scrollbars)
    portfolioData.json   # Placeholder data file (currently unused — all content is hardcoded in JSX)
    pages/
      Home.jsx           # Dashboard page: hero, skill bars, operations list, sparkline telemetry, terminal log
    assets/              # Static images (hero.png, SVGs)
  public/
    icons.svg            # SVG sprite sheet (social icons: bluesky, discord, github, x)

stitch_screens/          # Design reference — AI-generated HTML mockups + PNG screenshots (not part of the app)
apply_palette.py         # Helper to update palette in stitch_screens reference files
download_screens.py      # Helper to download design reference screens
```

## Routing

| Path | Component | Status |
|------|-----------|--------|
| `/` | `Home` | Implemented |
| `/profile` | Inline placeholder | Stub |
| `/projects` | Inline placeholder | Stub |
| `/contact` | Inline placeholder | Stub |

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
- **No API calls or data fetching** — all content is hardcoded inline in component JSX
- **The `stitch_screens/` directory is the visual spec** — when implementing new pages, reference these HTML files for layout, spacing, and component patterns
