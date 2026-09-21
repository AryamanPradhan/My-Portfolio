import React, { useLayoutEffect, useState } from 'react';
import '@fontsource/vt323';

/**
 * Pixel robots that look like they're building the site. Each one is placed
 * on a real part of the page, so it scrolls with it and works on something
 * actual: a welder welds a panel seam, a builder hammers down a loose piece of
 * border, repair bots fix a chipped button and a cracked Stack tile, and two
 * painters paint the name in the header.
 *
 * Sprites are 32px-grid pixel art, composed from parts (head, torso, arms at
 * any angle, legs) and outlined automatically, so every pose stays on-model.
 * Frames swap and bots move in CSS only (keyframes in index.css); nothing is
 * clickable or announced; with reduced motion they stand still.
 *
 * The parent must be `position: relative` and not clip overflow.
 */

// Seven amber shades, darkest to brightest. '.' is transparent.
const PAL = {
  o: '#050300', // outline
  s: '#2A1B00', // deep shadow / visor
  d: '#6E4800', // shadow
  m: '#B87E00', // mid
  a: '#FFB000', // base amber
  h: '#FFD27A', // highlight
  w: '#FFF3D1', // glow
  // A loose piece of panel border. A step brighter than the real border
  // (#332200), which is too dark to read once it's lifted off the edge.
  g: '#5A3D00',
  l: '#A87A2A',
};
// The Stack page is one hue at five brightnesses (no near-white), so bots
// there are drawn in its palette instead. 'b' is the page background, for
// holes knocked out of things.
const PHOSPHOR = {
  o: '#050300', s: '#3D2700', d: '#8A5A00', m: '#8A5A00',
  a: '#FFB000', h: '#FFD27A', w: '#FFD27A', b: '#1A1100',
};
const PX = 1.5; // screen px per sprite px; crisp on 2x displays, where most people are

// ── A tiny pixel painter ────────────────────────────────────────────────────

const toGrid = (rows) => rows.map((r) => r.split(''));

const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const px = (g, x, y, c) => { if (g[y] && x >= 0 && x < g[0].length) g[y][x] = c; };
const rect = (g, x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(g, i, j, c); };

// A lit box: highlight on the top and left, shade on the right and bottom.
function box(g, x, y, w, h) {
  rect(g, x, y, w, h, 'a');
  rect(g, x, y, w, 1, 'h');
  rect(g, x, y, 1, h, 'h');
  rect(g, x + w - 1, y + 1, 1, h - 1, 'm');
  rect(g, x + 1, y + h - 1, w - 1, 1, 'd');
}

// A thick line (square brush), for limbs at any angle.
function limb(g, x0, y0, x1, y1, c, t = 3) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    rect(g, x - (t >> 1), y - (t >> 1), t, t, c);
  }
}

// Every empty pixel touching a filled one becomes outline.
function outline(g) {
  const h = g.length, w = g[0].length;
  const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && g[y][x] !== '.' && g[y][x] !== 'O';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] === '.' && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) g[y][x] = 'O';
  }
  for (const row of g) for (let x = 0; x < w; x++) if (row[x] === 'O') row[x] = 'o';
  return g;
}

// ── The robot ───────────────────────────────────────────────────────────────

// Fills the shape `inside(x, y)` within a bounding box and lights it: edges
// facing up or left catch the light, edges facing down or right fall into
// shade. It works for any shape, so rounded parts shade themselves.
function shape(g, x0, y0, x1, y1, inside, base = 'a') {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!inside(x, y)) continue;
    let c = base;
    if (!inside(x, y - 1) || !inside(x - 1, y)) c = 'h';
    else if (!inside(x, y + 1)) c = 'd';
    else if (!inside(x + 1, y)) c = 'm';
    px(g, x, y, c);
  }
}
// The same without lighting, for flat surfaces like glass.
function flat(g, x0, y0, x1, y1, inside, c) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x, y)) px(g, x, y, c);
}
const roundRect = (x0, y0, x1, y1, r) => (x, y) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.8;
};
const ellipse = (cx, cy, rx, ry = rx) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.05;

/**
 * Draws one robot into `g` on a 48px grid: a little CRT monitor for a head,
 * glowing eyes and a smile on its glass, a coiled neck, a chest panel with a
 * dial and a level meter, round joints, a belt and boots.
 * arms: { l: [x, y], r: [x, y] } hand positions; mask: welding visor down.
 */
function robot(g, { arms, mask = false }) {
  // Arms first, so the shoulders and torso sit over them.
  for (const [sx, hand] of [[13, arms.l], [34, arms.r]]) {
    limb(g, sx, 29, hand[0], hand[1], 'd', 4);
    limb(g, sx, 29, hand[0], hand[1], 'm', 1);
  }
  for (const [hx, hy] of [arms.l, arms.r]) shape(g, hx - 3, hy - 3, hx + 3, hy + 3, ellipse(hx, hy, 2.6));

  // Antenna, with a glowing bulb.
  rect(g, 23, 3, 2, 4, 'd');
  flat(g, 20, 0, 27, 4, ellipse(23.5, 1.8, 2.2, 1.9), 'h');
  flat(g, 20, 0, 27, 4, ellipse(23.5, 1.8, 1.2, 1), 'w');

  // Head: a small CRT monitor, ear bolts either side.
  shape(g, 8, 12, 10, 18, roundRect(8, 12, 10, 18, 1));
  shape(g, 37, 12, 39, 18, roundRect(37, 12, 39, 18, 1));
  shape(g, 11, 6, 36, 24, roundRect(11, 6, 36, 24, 4));
  flat(g, 15, 9, 32, 21, roundRect(15, 9, 32, 21, 2), 's');
  px(g, 16, 10, 'd'); px(g, 17, 10, 'd'); px(g, 16, 11, 'd'); // glare on the glass
  px(g, 31, 23, 'w'); px(g, 29, 23, 'm');                       // power light, knob
  if (mask) {
    rect(g, 17, 14, 14, 2, 'h');
    rect(g, 19, 14, 10, 1, 'w');
  } else {
    for (const ex of [18, 26]) { rect(g, ex, 12, 4, 4, 'w'); rect(g, ex, 15, 4, 1, 'h'); }
    for (const [x, y] of [[20, 18], [21, 19], [22, 19], [23, 19], [24, 19], [25, 19], [26, 19], [27, 18]]) px(g, x, y, 'h');
    px(g, 17, 18, 'm'); px(g, 30, 18, 'm');                     // blush
  }

  // Coiled neck.
  rect(g, 20, 25, 8, 3, 'd');
  for (let x = 20; x < 28; x += 2) px(g, x, 26, 'm');

  // Shoulders, torso, chest panel (dial, level meter, lights), vents, belt.
  shape(g, 9, 25, 17, 33, ellipse(13, 29, 3.2));
  shape(g, 30, 25, 38, 33, ellipse(34, 29, 3.2));
  shape(g, 14, 27, 33, 39, roundRect(14, 27, 33, 39, 3));
  flat(g, 18, 29, 29, 35, roundRect(18, 29, 29, 35, 1), 's');
  flat(g, 19, 30, 23, 34, ellipse(21, 32, 1.6), 'h'); px(g, 21, 32, 'w');
  rect(g, 24, 31, 3, 1, 'w'); px(g, 27, 31, 'd');
  px(g, 24, 33, 'h'); px(g, 26, 33, 'a'); px(g, 28, 33, 'd');
  for (let x = 17; x <= 30; x += 2) px(g, x, 37, 'm');
  rect(g, 15, 39, 18, 2, 'd'); rect(g, 22, 39, 4, 2, 'h'); px(g, 23, 40, 'm');

  // Legs with knee joints, and boots.
  for (const x of [18, 26]) { rect(g, x, 41, 4, 4, 'd'); rect(g, x, 42, 4, 1, 'm'); }
  shape(g, 16, 44, 23, 46, roundRect(16, 44, 23, 46, 1));
  shape(g, 25, 44, 32, 46, roundRect(25, 44, 32, 46, 1));
  return g;
}

// Robots are drawn on a 48px grid and shown at 1:1, sharp on 2x screens;
// everything smaller (sparks, planks, chips) is drawn at PX.
const done = (g) => Object.assign(outline(g), { scale: 1 });

// ── Frames ──────────────────────────────────────────────────────────────────

// Hammer raised, then struck down onto the edge by its feet, sparks flying.
function builderFrame(down) {
  const g = grid(66, 48);
  if (down) {
    robot(g, { arms: { l: [10, 38], r: [44, 39] } });
    limb(g, 45, 39, 52, 39, 'd', 3);                              // handle
    shape(g, 51, 33, 58, 46, roundRect(51, 33, 58, 46, 1));      // head, striking
    px(g, 61, 44, 'w'); px(g, 63, 41, 'h'); px(g, 48, 45, 'h');
  } else {
    robot(g, { arms: { l: [10, 38], r: [40, 12] } });
    limb(g, 41, 10, 45, 3, 'd', 3);
    shape(g, 38, 0, 53, 6, roundRect(38, 0, 53, 6, 1));          // head, raised
  }
  return done(g);
}

// Mask down, short forearm, torch held straight down so the flame meets the
// seam at its feet.
function welderFrame() {
  const g = grid(54, 48);
  robot(g, { arms: { l: [10, 38], r: [40, 31] }, mask: true });
  shape(g, 38, 31, 44, 40, roundRect(38, 31, 44, 40, 1));        // torch body
  rect(g, 40, 41, 3, 2, 'd');                                     // nozzle
  px(g, 41, 43, 'h'); px(g, 42, 43, 'w'); px(g, 41, 44, 'w'); px(g, 42, 45, 'w'); // flame
  return done(g);
}

// Wrench up, then wrench turned down: working a corner at head height.
function repairFrame(down) {
  const g = grid(57, 48);
  const hand = down ? [42, 19] : [42, 15];
  robot(g, { arms: { l: [10, 38], r: hand } });
  const [hx, hy] = hand;
  limb(g, hx + 2, hy, hx + 9, hy - 3, 'd', 2);  // handle
  rect(g, hx + 9, hy - 8, 4, 3, 'm');           // jaw, upper
  rect(g, hx + 9, hy - 1, 4, 3, 'm');           // jaw, lower
  px(g, hx + 9, hy - 8, 'h');
  return done(g);
}

const SPARKS = [
  ['.w..h.', 'w.h...', '..w.h.', '.h...w'],
  ['h...w.', '..h..h', 'w..w..', '..h.w.'],
];

// A loose length of the panel's top border, nailed down at the far end.
// Raised while the hammer is up; knocked flat, splinters flying, on the hit.
const PLANK = [
  [
    'llll......................',
    'gggglll...................',
    '....gggllll...............',
    '.......gggglll............',
    '...........gggglll........',
    '...............gggglll....',
    '...................ggggllh',
    '.......................ggg',
  ],
  [
    '..........................',
    '..........................',
    '..........................',
    '..h.......................',
    'h...d.....................',
    '.d........................',
    'lllllllllllllllllllllllllh',
    'gggggggggggggggggggggggggg',
  ],
].map(toGrid);

// Peeking over a ledge: only the top half shows, cut off by the screen's
// bottom edge. The left hand grips the edge; the right one waves.
function peekFrame(out) {
  const g = grid(51, 48);
  robot(g, { arms: { l: [8, 33], r: out ? [45, 9] : [39, 6] } });
  const top = g.slice(0, 35);
  shape(top, 4, 31, 11, 34, roundRect(4, 31, 11, 38, 2));        // hand over the edge
  px(top, 6, 33, 'd'); px(top, 6, 34, 'd'); px(top, 9, 33, 'd'); px(top, 9, 34, 'd'); // fingers
  return done(top);
}

// A small painter, facing right: brush up on one frame, brush down the next.
function painterFrame(down) {
  const g = grid(20, 21);
  const hand = down ? [15, 11] : [15, 7];
  limb(g, 5, 11, 2, 15, 'd', 2);                      // arm at its side
  limb(g, 12, 11, hand[0], hand[1], 'd', 2);          // brush arm
  rect(g, hand[0], hand[1], 2, 2, 'm');
  limb(g, hand[0] + 1, hand[1], 17, hand[1] - 3, 'd', 1); // handle
  rect(g, 17, hand[1] - 5, 2, 2, 'h');                // bristles, loaded with paint
  px(g, 18, hand[1] - 4, 'a');
  px(g, 8, 0, 'w'); px(g, 8, 1, 'd');                 // antenna
  box(g, 4, 2, 9, 6);                                 // head
  rect(g, 5, 4, 7, 2, 's'); px(g, 7, 4, 'w'); px(g, 10, 4, 'w');
  rect(g, 7, 8, 3, 1, 'd');                           // neck
  box(g, 4, 9, 9, 6);                                 // body
  rect(g, 6, 11, 4, 2, 's'); px(g, 7, 11, 'w'); px(g, 9, 11, 'h');
  rect(g, 6, 15, 2, 3, 'd'); rect(g, 10, 15, 2, 3, 'd'); // legs
  rect(g, 5, 18, 3, 1, 'a'); rect(g, 9, 18, 3, 1, 'a');  // feet
  return outline(g);
}

/**
 * The scribe: a typewriter that is also a robot. A sheet of paper stands in
 * its roller, its face is on the front, and two stubby arms work the keys.
 * pose: 'idle' | 'blink' | 'typeA' | 'typeB'. While typing, the hands
 * alternate and lines of "text" grow on the paper.
 */
function scribeFrame(pose) {
  const g = grid(30, 28);
  const typing = pose === 'typeA' || pose === 'typeB';

  // Paper, with the lines typed so far.
  rect(g, 9, 0, 12, 9, 'w');
  const lines = pose === 'typeA' ? [[2, 8], [4, 5]] : pose === 'typeB' ? [[2, 8], [4, 10], [6, 3]] : [[2, 8], [4, 6]];
  for (const [y, len] of lines) rect(g, 10, y, len, 1, 'm');

  // Roller across the top, knobs at both ends.
  shape(g, 6, 8, 23, 10, roundRect(6, 8, 23, 10, 1), 'm');
  shape(g, 3, 7, 6, 11, ellipse(4.5, 9, 1.7));
  shape(g, 23, 7, 26, 11, ellipse(24.5, 9, 1.7));

  // Body, face, keys.
  shape(g, 4, 11, 25, 23, roundRect(4, 11, 25, 23, 3));
  if (pose === 'blink') {
    rect(g, 10, 15, 3, 1, 's'); rect(g, 17, 15, 3, 1, 's');
  } else if (typing) {
    // Concentrating: eyes squeezed into little arches.
    for (const ex of [10, 17]) { px(g, ex, 15, 's'); px(g, ex + 1, 14, 's'); px(g, ex + 2, 15, 's'); }
  } else {
    for (const ex of [10, 17]) { rect(g, ex, 13, 3, 3, 's'); px(g, ex, 13, 'w'); }
  }
  px(g, 13, 17, 's'); px(g, 14, 18, 's'); px(g, 15, 18, 's'); px(g, 16, 17, 's');
  for (let x = 7; x <= 22; x += 2) px(g, x, 20, 'h');
  for (let x = 8; x <= 21; x += 2) px(g, x, 22, 'm');

  // Base and wheels.
  rect(g, 6, 24, 18, 2, 'd');
  shape(g, 6, 24, 10, 28, ellipse(8, 26, 1.6), 'm');
  shape(g, 19, 24, 23, 28, ellipse(21, 26, 1.6), 'm');

  // Arms, in front of the body so the hands land on the keys.
  const hands = pose === 'typeA' ? [[9, 22], [21, 18]] : pose === 'typeB' ? [[8, 18], [20, 22]] : [[7, 21], [22, 21]];
  for (const [[hx, hy], sx] of [[hands[0], 4], [hands[1], 25]]) {
    limb(g, sx, 16, hx, hy, 'd', 2);
    shape(g, hx - 2, hy - 2, hx + 2, hy + 2, ellipse(hx, hy, 1.8), 'm');
  }
  // A glint where a key just struck.
  if (typing) px(g, pose === 'typeA' ? 10 : 19, 19, 'w');
  return Object.assign(outline(g), { scale: 1 }); // 30x28: about a line of text tall
}

const PAINT_CAN = [
  '.oooooo.',
  'ohhhhhao',
  'oaaaaamo',
  'oaddddmo',
  'oaaaaamo',
  'oaaaaamo',
  '.oooooo.',
];

const FRAMES = {
  builder: [builderFrame(false), builderFrame(true)],
  welder: [welderFrame()],
  repair: [repairFrame(false), repairFrame(true)],
  painter: [painterFrame(false), painterFrame(true)],
  peek: [peekFrame(false), peekFrame(true)],
  scribeIdle: [scribeFrame('idle'), scribeFrame('blink')],
  scribeTyping: [scribeFrame('typeA'), scribeFrame('typeB')],
};

// A chunk knocked out of a button's corner: hole, broken bevel edge, crack.
const CHIP = [
  'sssssssmo...',
  'ssssssmo....',
  'sssssmo.....',
  'ssssmo......',
  'ssmmo.o.....',
  'smo....o....',
  'mo.....o....',
  '........o...',
  '.........o..',
];
// Where the falling pixels start (px from the chip's corner) and drift.
const CRUMBS = [
  { x: 6, y: 8, dx: '-4px', c: PAL.a, d: '0s' },
  { x: 10, y: 5, dx: '3px', c: PAL.h, d: '-0.6s' },
  { x: 3, y: 11, dx: '-2px', c: PAL.m, d: '-1.1s' },
  { x: 13, y: 3, dx: '5px', c: PAL.a, d: '-1.5s' },
];

// ── Rendering ───────────────────────────────────────────────────────────────

/** Pixel grid → SVG, one rect per horizontal run of a colour. */
function Sprite({ g, pal = PAL }) {
  const w = g[0].length, h = g.length, scale = g.scale ?? PX;
  const rects = [];
  g.forEach((row, y) => {
    for (let x = 0; x < w;) {
      let end = x + 1;
      while (end < w && row[end] === row[x]) end++;
      if (pal[row[x]]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={pal[row[x]]} />);
      x = end;
    }
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * scale} height={h * scale} shapeRendering="crispEdges" className="block">
      {rects}
    </svg>
  );
}

/** Two frames stacked; CSS alternates them. */
const Frames = ({ frames, speed, pal, className = '' }) => (
  <div className={`bot-frames relative ${className}`} style={{ '--bot-frame': speed }}>
    <Sprite g={frames[0]} pal={pal} />
    <div className="absolute inset-0"><Sprite g={frames[1]} pal={pal} /></div>
  </div>
);

const Crew = ({ className = '', style, children }) => (
  <div aria-hidden="true" className={`bot-crew pointer-events-none absolute bottom-full ${className}`} style={style}>
    {children}
  </div>
);

/** Welds the parent's top seam; `right` places it along the edge. */
export function WelderBot({ right = '12%', flip = false }) {
  return (
    <Crew style={{ right, transform: flip ? 'scaleX(-1)' : undefined }}>
      <div className="relative">
        <Sprite g={FRAMES.welder[0]} />
        {/* Sparks spray off the seam where the nozzle meets the border. */}
        <div className="absolute" style={{ left: 25 * PX, top: 27 * PX }}>
          <Frames frames={SPARKS.map(toGrid)} speed="0.16s" />
        </div>
      </div>
    </Crew>
  );
}

/**
 * A robot repairing the button it's placed next to: the button's top-left
 * corner is chipped and shedding pixels while the robot works a wrench on it.
 * Wrap the button in a `relative` element and put this beside it. The button
 * itself is untouched and keeps working. The robot stands to the button's
 * left, so the caller reserves that room where the row is tight.
 */
export function RepairBot() {
  return (
    <>
      {/* The damage sits on the button's corner and ignores the pointer. */}
      <div aria-hidden="true" className="bot-crew pointer-events-none absolute -left-[2px] -top-[2px] z-10">
        <Sprite g={toGrid(CHIP)} />
        {CRUMBS.map((c, i) => (
          <span
            key={i}
            className="bot-fall absolute w-[3px] h-[3px]"
            style={{ left: c.x, top: c.y, background: c.c, '--dx': c.dx, animationDelay: c.d }}
          />
        ))}
      </div>
      {/* Stands on the row's floor, wrench on the chipped corner. */}
      <div aria-hidden="true" className="bot-crew pointer-events-none absolute -bottom-3 right-[calc(100%-6px)]">
        <div className="relative">
          <Frames frames={FRAMES.repair} speed="0.45s" />
          <div className="absolute" style={{ left: 34 * PX, top: 4 * PX }}>
            <Frames frames={SPARKS.map(toGrid)} speed="0.16s" />
          </div>
        </div>
      </div>
    </>
  );
}

// A bite out of a tile's right edge: the hole shows the page behind it,
// ringed by the tile's broken border.
const NOTCH = [
  '......dbb',
  '....ddbbb',
  '...dbbbbb',
  '..dbbbbbb',
  '.dbbbbbbb',
  'dbbbbbbbb',
  '.dbbbbbbb',
  '..ddbbbbb',
  '....dbbbb',
  '.....dbbb',
  '......dbb',
  '.......db',
];

/**
 * A Stack tile with a chunk knocked out of its right edge, a crack across its
 * logo, pixels crumbling off, and a robot beside it working the break with a
 * wrench. Goes inside the tile's cell, which must be `relative`.
 *
 * The robot needs empty space to the cell's right, so the broken tool must
 * end its row: it shows on phones (3 columns) and desktop (7), where the
 * current list leaves room, and hides on tablets (5), where it doesn't.
 */
export function BrokenTileBot() {
  return (
    <>
      <div aria-hidden="true" className="bot-crew pointer-events-none absolute inset-0 z-10">
        {/* The crack: a stepped line from the break into the logo. */}
        <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" shapeRendering="crispEdges">
          <polyline
            points="39,19 35,19 35,22 30,22 30,20 26,20 26,25 21,25 21,23 17,23 17,28 14,28"
            fill="none"
            stroke={PHOSPHOR.o}
            strokeWidth="2"
          />
        </svg>
        <div className="absolute -right-[1px] top-[30%]">
          <Sprite g={toGrid(NOTCH)} pal={PHOSPHOR} />
          {CRUMBS.slice(0, 3).map((c, i) => (
            <span
              key={i}
              className="bot-fall absolute w-[3px] h-[3px]"
              style={{ left: 2 + (i % 2) * 3, top: 6 + i * 2, background: i ? PHOSPHOR.h : PHOSPHOR.a, '--dx': c.dx, animationDelay: c.d }}
            />
          ))}
        </div>
      </div>
      {/* Faces the tile, feet level with its bottom, wrench on the break. */}
      <div
        aria-hidden="true"
        className="bot-crew pointer-events-none absolute left-full bottom-0 -ml-[3px] sm:hidden lg:block"
        style={{ transform: 'scaleX(-1)' }}
      >
        <div className="relative">
          <Frames frames={FRAMES.repair} speed="0.45s" pal={PHOSPHOR} />
          <div className="absolute" style={{ left: 34 * PX, top: 4 * PX }}>
            <Frames frames={SPARKS.map(toGrid)} speed="0.16s" pal={PHOSPHOR} />
          </div>
        </div>
      </div>
    </>
  );
}

/** Paint drips falling from a brush: a few pixels, dropping in steps. */
const Drips = ({ side, fall }) => (
  <>
    {[0, 1].map((i) => (
      <span
        key={i}
        className="bot-fall absolute w-[3px] h-[3px]"
        style={{
          [side]: i * 3 - 1, top: '45%', background: i ? PAL.h : PAL.a,
          '--dx': '0px', '--fall': fall, animationDelay: `${-i * 0.9}s`,
        }}
      />
    ))}
  </>
);

/**
 * Wraps a word (the name in the header) with two small robots painting it,
 * one at each end, brushes on the first and last letters, paint dripping.
 * The robots are absolutely placed, so the caller reserves room for them with
 * margins in `className`. The header is tight: the right one shows on
 * tablets (sm to lg, where the nav links are folded away) and from xl up; the
 * left one from xl up. Phones and the lg-xl band have no room for them.
 */
export function PaintedName({ className = '', fall = '12px', children }) {
  return (
    <div className={className}>
      <div className="relative inline-block">
        {children}
        <div aria-hidden="true" className="bot-crew pointer-events-none absolute inset-0">
          {/* Left painter, facing right, on the first letter. */}
          <div className="absolute right-full bottom-0 -mr-[2px] hidden xl:block">
            <Frames frames={FRAMES.painter} speed="0.6s" />
          </div>
          <div className="hidden xl:block"><Drips side="left" fall={fall} /></div>
          {/* Right painter, facing left, on the last letter; tracking adds
              trailing space after it, hence the pull-in. */}
          <div className="absolute left-full bottom-0 -ml-[7px] hidden sm:flex lg:hidden xl:flex items-end">
            <div style={{ transform: 'scaleX(-1)' }}>
              <Frames frames={FRAMES.painter} speed="0.7s" />
            </div>
            <Sprite g={toGrid(PAINT_CAN)} />
          </div>
          <div className="hidden sm:block lg:hidden xl:block"><Drips side="right" fall={fall} /></div>
        </div>
      </div>
    </div>
  );
}

// Where the caret sits inside a textarea or input, in px from its top-left
// corner. Neither exposes this, so a hidden copy with the same box and font
// is filled with the text up to the caret, and a marker after it is measured.
// (Email inputs don't report a selection at all; there the caret is taken to
// be at the end of the text.)
const MIRRORED = [
  'boxSizing', 'width', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight',
  'fontStretch', 'fontSize', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
  'letterSpacing', 'wordSpacing', 'tabSize',
];
function caretPosition(ta) {
  const cs = getComputedStyle(ta);
  const mirror = document.createElement('div');
  for (const p of MIRRORED) mirror.style[p] = cs[p];
  Object.assign(mirror.style, {
    position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px',
    whiteSpace: ta.tagName === 'INPUT' ? 'pre' : 'pre-wrap', overflowWrap: 'break-word', overflow: 'hidden',
  });
  const end = ta.selectionEnd ?? ta.value.length;
  mirror.textContent = ta.value.slice(0, end);
  const marker = document.createElement('span');
  marker.textContent = ta.value.slice(end) || '.';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
  const pos = { x: marker.offsetLeft - ta.scrollLeft, y: marker.offsetTop - ta.scrollTop, lineHeight };
  mirror.remove();
  return pos;
}

/**
 * The typewriter robot that stands in for the text cursor in the contact
 * form's fields. While its field has focus it sits right after the caret
 * (give the field `caret-transparent`), types along while `typing` is true,
 * and blinks when the visitor pauses. Without focus it rests in the corner
 * (`rest="corner"`, for roomy textareas) or isn't shown at all (the default,
 * for single-line inputs). Render it next to the field, inside a `relative`
 * wrapper around both.
 */
export function ScribeBot({ targetRef, typing, rest = 'hidden' }) {
  const [spot, setSpot] = useState(null); // null: resting in the corner
  const W = 30, H = 28;

  useLayoutEffect(() => {
    const ta = targetRef.current;
    if (!ta) return;
    const place = () => {
      if (document.activeElement !== ta) { setSpot(null); return; }
      const { x, y, lineHeight } = caretPosition(ta);
      // Just after the caret and kept inside the box: on the line's baseline
      // in a textarea, centred in a single-line input.
      const left = Math.max(4, Math.min(x + 1, ta.clientWidth - W - 4));
      const top = ta.tagName === 'INPUT'
        ? (ta.offsetHeight - H) / 2
        : Math.max(2, Math.min(y + lineHeight - H + 4, ta.clientHeight - H - 2));
      setSpot({ left, top });
    };
    const events = ['focus', 'blur', 'input', 'keyup', 'click', 'select', 'scroll'];
    for (const e of events) ta.addEventListener(e, place);
    window.addEventListener('resize', place);
    return () => {
      for (const e of events) ta.removeEventListener(e, place);
      window.removeEventListener('resize', place);
    };
  }, [targetRef]);

  if (!spot && rest === 'hidden') return null;
  return (
    <div
      aria-hidden="true"
      className={`bot-crew pointer-events-none absolute ${spot ? 'top-0 left-0' : 'bottom-2 right-3'}`}
      style={spot ? { transform: `translate(${spot.left}px, ${spot.top}px)` } : undefined}
    >
      {typing
        ? <Frames frames={FRAMES.scribeTyping} speed="0.22s" />
        : <Frames frames={FRAMES.scribeIdle} className="bot-blink" />}
    </div>
  );
}

/**
 * A robot peeking up over the bottom edge of the screen, bottom-right on every
 * page, like a kid pulled up to a windowsill: head and shoulders only, one
 * hand gripping the edge, the other waving, with a "HI!" that pops up every
 * few seconds. Unlike the working robots it is pinned to the screen, not the
 * page: it's the site saying hello, not part of the build. Sits under the
 * header, menu and project windows (z-30). `phosphor` draws it in the Stack
 * page's single-hue palette.
 */
export function GreeterBot({ phosphor = false }) {
  const pal = phosphor ? PHOSPHOR : PAL;
  return (
    <div aria-hidden="true" className="bot-crew pointer-events-none fixed bottom-0 right-4 z-30">
      <div
        className="bot-hi absolute bottom-full right-1 mb-1 font-vt323 text-[22px] leading-none px-2 pt-1 pb-0.5 border-2"
        style={{ background: pal.o, color: pal.h, borderColor: pal.a }}
      >
        HI!
        {/* Tail, pointing down at the robot. */}
        <span className="absolute -bottom-[8px] right-4 w-[6px] h-[6px]" style={{ background: pal.a }} />
        <span className="absolute -bottom-[4px] right-[18px] w-[4px] h-[4px]" style={{ background: pal.o }} />
      </div>
      <div className="bot-peek">
        <Frames frames={FRAMES.peek} speed="0.5s" pal={pal} />
      </div>
    </div>
  );
}

/**
 * Hammers down a loose plank of the parent's own top border. The plank's two
 * frames run on the same clock as the hammer's, so it lifts with the swing
 * and lands flat on the hit.
 */
export function BuilderBot({ right = '2rem' }) {
  return (
    <Crew className="flex items-end" style={{ right }}>
      <Frames frames={FRAMES.builder} speed="0.55s" />
      <div style={{ marginLeft: -11 * PX }}><Frames frames={PLANK} speed="0.55s" /></div>
    </Crew>
  );
}
