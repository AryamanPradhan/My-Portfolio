import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '@fontsource/vt323';
import '@fontsource/ibm-plex-mono/400.css';
import { STACK_GROUPS, STACK_GROUP_LABELS, STACK_TOOLS } from '../stackData';

/**
 * The tool stack, printed like a directory listing on an amber CRT.
 *
 * One hue throughout (the `phosphor` palette); brightness is the only thing
 * that varies. Selection is inverted video. Nothing fades: the tooltip is
 * drawn and erased like a screen redraw, and the only entrance is the tiles
 * printing in one by one when the section first scrolls into view.
 */

const TYPE_MS = 12;
const TILE_STAGGER_S = 0.025;
const GROUP_PAUSE_S = 0.12; // a beat between groups, like output arriving in chunks
const GAP = 12; // between a tile and its readout

const GLOW = '[text-shadow:0_0_8px_rgba(255,176,0,0.45)]';

const byGroup = STACK_GROUPS.map((group) => ({
  group,
  tools: STACK_TOOLS.filter((t) => t.group === group),
}));
const ORDER = byGroup.flatMap((g) => g.tools.map((t) => t.slug));
const TOOL = Object.fromEntries(STACK_TOOLS.map((t) => [t.slug, t]));

const useMedia = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

// Counts up one character every TYPE_MS. Keyed, so a new selection starts at
// zero on its very first render instead of flashing the previous count.
function useTyped(key, total, instant) {
  const [state, setState] = useState({ key, n: 0 });
  useEffect(() => {
    if (instant || !key) return;
    const id = setInterval(() => {
      setState((s) => {
        const n = s.key === key ? s.n + 1 : 1;
        if (n >= total) clearInterval(id);
        return { key, n: Math.min(n, total) };
      });
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [key, total, instant]);
  if (instant) return total;
  return state.key === key ? state.n : 0;
}

const Cursor = () => (
  <span aria-hidden="true" className="animate-[cursor-blink_1s_step-end_infinite] motion-reduce:animate-none">█</span>
);

function Glyph({ icon }) {
  if (icon?.type === 'brand') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 fill-current">
        <path d={icon.path} />
      </svg>
    );
  }
  return (
    <span aria-hidden="true" className="material-symbols-outlined text-[32px] leading-none">
      {icon?.name ?? 'terminal'}
    </span>
  );
}

/** The `cat <tool>.txt` printout, floating (desktop/tablet) or docked (mobile). */
function Readout({ tool, reduced, onOpenBuild, docked, onClose, place, tipRef, onPointerLeave }) {
  // Lines of segments; links are segments with a build. The body types in
  // character by character across all of them.
  const lines = [[{ text: tool.description }]];
  if (tool.usedIn.length) {
    lines.push([
      { text: 'used in: ' },
      ...tool.usedIn.flatMap((b, i) => [...(i ? [{ text: ', ' }] : []), { text: b.name, build: b }]),
    ]);
  }
  const total = lines.flat().reduce((n, s) => n + s.text.length, 0);
  const shown = useTyped(tool.slug, total, reduced);

  let left = shown;
  let cursorLine = 0;
  const rendered = lines.map((segs) =>
    segs.map((seg, i) => {
      const text = seg.text.slice(0, Math.max(0, left));
      left -= seg.text.length;
      return { ...seg, text, key: i };
    }),
  );
  rendered.forEach((segs, i) => { if (segs.some((s) => s.text)) cursorLine = i; });

  const renderLine = (segs, interactive) =>
    segs.map((seg) =>
      seg.build && interactive ? (
        <a
          key={seg.key}
          href={`/#${seg.build.slug}`}
          onClick={(e) => { e.preventDefault(); onOpenBuild(seg.build.codename); }}
          className={`text-phosphor-hot underline underline-offset-2 decoration-phosphor-dim hover:bg-phosphor hover:text-phosphor-black focus-visible:bg-phosphor focus-visible:text-phosphor-black outline-none ${GLOW}`}
        >
          {seg.text}
        </a>
      ) : (
        <span key={seg.key} className={seg.build ? 'text-phosphor-hot' : undefined}>{seg.text}</span>
      ),
    );

  return (
    <div
      ref={tipRef}
      id="stack-readout"
      className={
        docked
          ? 'relative border border-phosphor bg-phosphor-black p-4 mt-6'
          : 'absolute z-20 border border-phosphor bg-phosphor-black p-4 shadow-phosphor'
      }
      style={docked ? undefined : place.style}
      onPointerLeave={onPointerLeave}
    >
      {/* Invisible bridge over the gap to the tile, one tile wide, so the
          pointer can travel from the tile to the links without the readout
          closing under it. */}
      {!docked && place.notch && (
        <span
          aria-hidden="true"
          className="absolute w-[72px]"
          style={{ left: place.notch - 36, height: GAP, [place.above ? 'top' : 'bottom']: '100%' }}
        />
      )}
      {!docked && place.notch && (
        <span
          aria-hidden="true"
          className={`absolute w-2.5 h-2.5 bg-phosphor-black border-phosphor rotate-45 ${
            place.above ? '-bottom-[6px] border-r border-b' : '-top-[6px] border-l border-t'
          }`}
          style={{ left: place.notch - 5 }}
        />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="font-plex-mono text-[0.875rem] text-phosphor-dim">&gt; cat {tool.slug}.txt</div>
        {docked && (
          <button
            onClick={onClose}
            className="font-plex-mono text-[0.875rem] text-phosphor-dim hover:text-phosphor-black hover:bg-phosphor focus-visible:text-phosphor-black focus-visible:bg-phosphor outline-none px-1"
          >
            [x]
          </button>
        )}
      </div>
      <div className={`font-vt323 text-[1.75rem] leading-none text-phosphor-hot mt-2 mb-2 ${GLOW}`}>{tool.name}</div>
      {/* The invisible copy holds the box at its final size, so it doesn't
          grow as the text types in and the anchor never has to move. */}
      <div className={`grid font-plex-mono text-[0.875rem] leading-[1.6] text-phosphor ${docked ? '' : 'w-[42ch]'} max-w-full`}>
        <div aria-hidden="true" className="invisible [grid-area:1/1]">
          {lines.map((segs, i) => (
            <p key={i} className={i ? 'mt-2' : undefined}>
              {renderLine(segs.map((s, k) => ({ ...s, key: k })), false)}█
            </p>
          ))}
        </div>
        <div className="[grid-area:1/1]">
          {rendered.map((segs, i) => (
            <p key={i} className={i ? 'mt-2' : undefined}>
              {renderLine(segs, true)}
              {i === cursorLine && <Cursor />}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StackSection({ onOpenBuild }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const mobile = useMedia('(max-width: 639px)');

  const [selected, setSelected] = useState(null); // slug
  const [source, setSource] = useState(null); // 'pointer' | 'keyboard' | 'tap'
  const [focusSlug, setFocusSlug] = useState(ORDER[0]);
  const [place, setPlace] = useState({ style: { visibility: 'hidden' } });

  const rootRef = useRef(null);
  const tipRef = useRef(null);
  const tileRefs = useRef({});
  const gridRefs = useRef({});

  const tool = selected ? TOOL[selected] : null;

  const select = useCallback((slug, how) => {
    setSelected(slug);
    setSource(how);
    if (slug) setFocusSlug(slug);
  }, []);

  // ── Entry: print the tiles one by one, group after group. Once. ──
  useLayoutEffect(() => {
    if (reduced) return;
    const tiles = (g) => byGroup.find((x) => x.group === g).tools.map((t) => tileRefs.current[t.slug]);
    gsap.set(STACK_GROUPS.flatMap(tiles), { visibility: 'hidden' });

    let tl;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      tl = gsap.timeline();
      STACK_GROUPS.forEach((g, i) => {
        tl.to(tiles(g), { visibility: 'visible', duration: 0, stagger: TILE_STAGGER_S }, i ? `+=${GROUP_PAUSE_S}` : 0);
      });
    }, { threshold: 0.15 });
    io.observe(rootRef.current);

    return () => {
      io.disconnect();
      tl?.kill();
      gsap.set(STACK_GROUPS.flatMap(tiles), { clearProps: 'visibility' });
    };
  }, [reduced]);

  // ── Anchor the floating readout above the tile, or below if no room. ──
  useLayoutEffect(() => {
    if (!tool || mobile || !tipRef.current) return;
    const root = rootRef.current.getBoundingClientRect();
    const tile = tileRefs.current[tool.slug].firstElementChild.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();

    // The page column scrolls on its own, so "room" is measured against
    // whichever ancestor actually clips us, not just the window.
    let clipTop = 0;
    for (let el = rootRef.current.parentElement; el; el = el.parentElement) {
      if (/(auto|scroll|hidden)/.test(getComputedStyle(el).overflowY)) {
        clipTop = Math.max(clipTop, el.getBoundingClientRect().top);
        break;
      }
    }
    const above = tile.top - tip.height - GAP >= clipTop;
    const top = above ? tile.top - root.top - tip.height - GAP : tile.bottom - root.top + GAP;
    const left = Math.max(0, Math.min(tile.left - root.left, root.width - tip.width));
    const notch = tile.left - root.left + tile.width / 2 - left;
    setPlace({ style: { top, left }, above, notch });
  }, [tool, mobile]);

  // ── Keyboard: arrows walk the grid and cross between groups. ──
  const columns = (group) => getComputedStyle(gridRefs.current[group]).gridTemplateColumns.split(' ').length;

  const move = (slug, key) => {
    const gi = byGroup.findIndex((g) => g.group === TOOL[slug].group);
    const list = byGroup[gi].tools;
    const i = list.findIndex((t) => t.slug === slug);
    const cols = columns(byGroup[gi].group);
    const flat = ORDER.indexOf(slug);

    if (key === 'ArrowLeft') return ORDER[Math.max(0, flat - 1)];
    if (key === 'ArrowRight') return ORDER[Math.min(ORDER.length - 1, flat + 1)];
    if (key === 'ArrowDown') {
      if (i + cols < list.length) return list[i + cols].slug;
      if (Math.floor(i / cols) < Math.floor((list.length - 1) / cols)) return list[list.length - 1].slug;
      const next = byGroup[gi + 1]?.tools;
      return next ? next[Math.min(i % cols, next.length - 1)].slug : slug;
    }
    if (key === 'ArrowUp') {
      if (i - cols >= 0) return list[i - cols].slug;
      const prev = byGroup[gi - 1]?.tools;
      if (!prev) return slug;
      const pc = columns(byGroup[gi - 1].group);
      const lastRow = Math.floor((prev.length - 1) / pc) * pc;
      return prev[Math.min(lastRow + (i % cols), prev.length - 1)].slug;
    }
    return slug;
  };

  const onTileKeyDown = (e, slug) => {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const to = move(slug, e.key);
      tileRefs.current[to].focus();
      select(to, 'keyboard');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(slug, 'keyboard');
      const first = TOOL[slug].usedIn[0];
      if (first) onOpenBuild(first.codename);
    } else if (e.key === 'Escape') {
      select(null, null);
    }
  };

  const onTileClick = (slug) => {
    if (mobile) select(selected === slug ? null : slug, 'tap');
    else select(slug, 'pointer');
  };

  // Phosphor burn-in: a tile the pointer just left glows faintly for a moment.
  const burn = (slug) => {
    const cell = tileRefs.current[slug]?.firstElementChild;
    if (!cell || reduced) return;
    cell.dataset.burn = '';
    setTimeout(() => { delete cell.dataset.burn; }, 400);
  };

  const builds = tool?.usedIn.length ?? 0;

  return (
    <section
      ref={rootRef}
      className="relative max-w-[1120px] font-plex-mono text-phosphor py-2"
      onPointerLeave={(e) => { if (e.pointerType === 'mouse' && source === 'pointer') select(null, null); }}
      onBlur={(e) => {
        if (source === 'keyboard' && !rootRef.current.contains(e.relatedTarget)) select(null, null);
      }}
    >
      {byGroup.map(({ group, tools }) => (
        <div key={group} className="mb-8 last:mb-0">
          <h2 className={`font-vt323 text-[1.75rem] sm:text-[2.25rem] leading-none mb-4 ${GLOW}`}>
            {STACK_GROUP_LABELS[group]}
          </h2>
          <ul
            ref={(el) => { gridRefs.current[group] = el; }}
            className="grid grid-cols-[repeat(3,minmax(0,88px))] sm:grid-cols-[repeat(5,minmax(0,96px))] lg:grid-cols-[repeat(7,minmax(0,96px))] gap-x-2 gap-y-5"
          >
            {tools.map((t) => {
              const isSel = selected === t.slug;
              return (
                <li key={t.slug}>
                  <button
                    ref={(el) => { tileRefs.current[t.slug] = el; }}
                    tabIndex={focusSlug === t.slug ? 0 : -1}
                    aria-pressed={isSel}
                    aria-describedby={isSel && (!mobile || source === 'tap') ? 'stack-readout' : undefined}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') select(t.slug, 'pointer'); }}
                    onPointerLeave={(e) => {
                      if (e.pointerType !== 'mouse') return;
                      burn(t.slug);
                      if (source === 'pointer' && !tipRef.current?.contains(e.relatedTarget)) select(null, null);
                    }}
                    onFocus={(e) => { if (e.target.matches(':focus-visible')) select(t.slug, 'keyboard'); }}
                    onClick={() => onTileClick(t.slug)}
                    onKeyDown={(e) => onTileKeyDown(e, t.slug)}
                    className="group w-full flex flex-col items-center gap-2 outline-none cursor-pointer"
                  >
                    <span
                      className={
                        'flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] border ' +
                        'data-[burn]:border-phosphor-burn ' +
                        'group-focus-visible:bg-phosphor group-focus-visible:text-phosphor-black group-focus-visible:border-phosphor group-focus-visible:shadow-phosphor ' +
                        (isSel
                          ? 'bg-phosphor text-phosphor-black border-phosphor shadow-phosphor animate-phosphor-flicker motion-reduce:animate-none'
                          : 'bg-phosphor-black text-phosphor border-phosphor-dim')
                      }
                    >
                      <Glyph icon={t.icon} />
                    </span>
                    <span
                      className={`text-[0.8125rem] leading-tight text-center break-words max-w-full ${
                        isSel ? `text-phosphor-hot ${GLOW}` : 'text-phosphor group-focus-visible:text-phosphor-hot'
                      }`}
                    >
                      {t.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Rendered after its own group so Tab goes tile → readout links. */}
          {tool && !mobile && tool.group === group && (
            <Readout
              tool={tool}
              reduced={reduced}
              onOpenBuild={onOpenBuild}
              place={place}
              tipRef={tipRef}
              onPointerLeave={(e) => {
                // Back onto its own tile keeps it; anywhere else closes it.
                const tile = tileRefs.current[tool.slug];
                if (e.pointerType === 'mouse' && source === 'pointer' && !tile?.contains(e.relatedTarget)) select(null, null);
              }}
            />
          )}
        </div>
      ))}

      {tool && mobile && (
        <Readout tool={tool} reduced={reduced} onOpenBuild={onOpenBuild} docked onClose={() => select(null, null)} />
      )}

      <div
        className="mt-6 pt-3 border-t border-phosphor-burn text-[0.8125rem] text-phosphor-dim flex flex-wrap gap-x-2"
      >
        {tool ? (
          <>
            <span>selected: <span className="text-phosphor">{tool.name}</span></span>
            <span>|</span>
            <span>{builds} {builds === 1 ? 'build' : 'builds'}</span>
            {builds > 0 && (<><span>|</span><span>↵ open</span></>)}
          </>
        ) : (
          <>
            <span className="text-phosphor">ready</span>
            <span>|</span>
            <span>{mobile ? 'tap a tile to inspect' : 'use arrow keys or hover to inspect'}</span>
          </>
        )}
        <span className="text-phosphor"><Cursor /></span>
      </div>
    </section>
  );
}
