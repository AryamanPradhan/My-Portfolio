import React, { useState, useRef, useEffect } from 'react';

const MODE = {
  auto:   { color: 'text-led-green',          border: 'border-led-green/50',   bg: 'bg-led-green/5',   label: 'AUTO',      icon: 'smart_toy',  dot: '#22C55E', idColor: 'text-led-green' },
  hybrid: { color: 'text-primary',            border: 'border-primary/50',     bg: 'bg-primary/5',     label: 'HYBRID',    icon: 'sync_alt',   dot: '#EA6B1E', idColor: 'text-primary' },
  human:  { color: 'text-primary-container',  border: 'border-primary-container/50', bg: 'bg-primary-container/5', label: 'HUMAN', icon: 'person', dot: '#FFB000', idColor: 'text-primary-container' },
};

function Node({ step, mode, isActive, onClick }) {
  const m = MODE[mode] || MODE.auto;
  return (
    <div
      className={`blueprint-node p-3 cursor-pointer min-h-[120px] flex flex-col ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className={`node-id ${m.idColor}`}>N-{String(step.step).padStart(2, '0')}</div>

      {/* Wraps rather than overflowing: at phone widths the grid leaves these
          nodes narrow enough that a 24px icon plus the HUMAN badge no longer
          fit on one line. */}
      <div className="flex items-center justify-between gap-1 mb-2 flex-wrap">
        <span className={`material-symbols-outlined text-2xl ${m.color}`} style={{ fontVariationSettings: "'FILL' 0" }}>
          {m.icon}
        </span>
        <span className={`font-label-caps text-[12px] px-1.5 py-0.5 border ${m.border} ${m.color}`}>
          {m.label}
        </span>
      </div>

      {/* break-words, not truncate: a step title is the one thing in the node
          that must stay readable, and single words like CLASSIFICATION are
          wider than the node at 390px. */}
      <div className="font-mono-data text-on-surface text-[14px] font-semibold leading-tight mb-1 break-words">
        {step.title}
      </div>
      <div className="font-mono-data text-outline text-[12px] mt-auto">
        {step.items.length} TASKS
      </div>

      {isActive && (
        <div className="mt-2 pt-2 border-t border-border-graphite/30 animate-fade-in space-y-1">
          {step.items.map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 font-mono-data text-[12px]">
              <span className={`${m.color} flex-shrink-0`}>&#9656;</span>
              <span className="text-on-surface-variant">{item}</span>
            </div>
          ))}
          {step.receives && (
            <div className="mt-1.5 pt-1.5 border-t border-border-graphite/20">
              <div className="font-label-caps text-[12px] text-outline mb-1">CLIENT INPUT</div>
              {step.receives.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 font-mono-data text-[12px]">
                  <span className="text-outline flex-shrink-0">&#8594;</span>
                  <span className="text-on-surface-variant">{r}</span>
                </div>
              ))}
            </div>
          )}
          {step.note && (
            <div className={`mt-1 font-mono-data text-[12px] ${m.color} italic`}>{step.note}</div>
          )}
        </div>
      )}
    </div>
  );
}

function Connectors({ containerRef, steps }) {
  const [dims, setDims] = useState(null);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const nodes = containerRef.current.querySelectorAll('[data-node]');
      if (nodes.length < 2) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rects = Array.from(nodes).map(n => {
        const r = n.getBoundingClientRect();
        return {
          cx: r.left - containerRect.left + r.width / 2,
          cy: r.top - containerRect.top + r.height / 2,
          right: r.right - containerRect.left,
          left: r.left - containerRect.left,
          top: r.top - containerRect.top,
          bottom: r.bottom - containerRect.top,
          width: r.width,
          height: r.height,
        };
      });
      setDims({ w: containerRect.width, h: containerRect.height, rects });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef, steps]);

  if (!dims || dims.rects.length < 2) return null;

  const lines = [];
  for (let i = 0; i < dims.rects.length - 1; i++) {
    const a = dims.rects[i];
    const b = dims.rects[i + 1];
    const sameRow = Math.abs(a.cy - b.cy) < 60;

    if (sameRow) {
      lines.push({ x1: a.right, y1: a.cy, x2: b.left, y2: b.cy, mode: steps[i].mode });
    } else {
      const midX = a.cx;
      const midY = a.bottom + (b.top - a.bottom) / 2;
      lines.push({ x1: a.cx, y1: a.bottom, x2: midX, y2: midY, mode: steps[i].mode });
      lines.push({ x1: midX, y1: midY, x2: b.cx, y2: b.top, mode: steps[i].mode });
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={MODE[l.mode]?.dot || '#EA6B1E'}
          strokeWidth="1.5"
          opacity="0.5"
          className="blueprint-connector"
        />
      ))}
    </svg>
  );
}

export default function WorkflowDiagram({ steps, codename }) {
  const [activeStep, setActiveStep] = useState(null);
  const gridRef = useRef(null);

  if (!steps || steps.length === 0) return null;

  const topRow = steps.slice(0, 4);
  const bottomRow = steps.slice(4);

  return (
    <div className="blueprint-grid relative rounded overflow-hidden">
      {/* Coordinate marks */}
      <div className="flex justify-between px-3 py-1 border-b border-border-graphite/20">
        <span className="font-mono-data text-[12px] text-outline">X-001</span>
        <span className="font-mono-data text-[12px] text-outline">SYS_ARCH: {codename || 'PIPELINE'}</span>
        <span className="font-mono-data text-[12px] text-outline">X-100</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-border-graphite/20">
        {Object.entries(MODE).map(([key, m]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2" style={{ backgroundColor: m.dot }} />
            <span className="font-label-caps text-[12px] text-outline">{m.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
          <span className="font-mono-data text-[12px] text-primary">LIVE</span>
        </div>
      </div>

      {/* Node grid */}
      <div ref={gridRef} className="relative p-4">
        <Connectors containerRef={gridRef} steps={steps} />

        {/* Row 1 */}
        <div className="blueprint-grid grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {topRow.map((step, i) => (
            <div key={step.step} data-node>
              <Node
                step={step}
                mode={step.mode}
                isActive={activeStep === i}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
              />
            </div>
          ))}
        </div>

        {/* Row 2 */}
        {bottomRow.length > 0 && (
          <div className="blueprint-grid grid gap-3 mt-3 relative z-10" style={{ gridTemplateColumns: `repeat(${Math.min(bottomRow.length, 4)}, minmax(0, 1fr))` }}>
            {bottomRow.map((step, i) => {
              const globalIdx = topRow.length + i;
              return (
                <div key={step.step} data-node>
                  <Node
                    step={step}
                    mode={step.mode}
                    isActive={activeStep === globalIdx}
                    onClick={() => setActiveStep(activeStep === globalIdx ? null : globalIdx)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border-graphite/20">
        <span className="font-mono-data text-outline text-[12px]">
          {steps.length} NODES &nbsp;|&nbsp; {steps.filter(s => s.mode === 'auto').length} AUTO &nbsp;|&nbsp; {steps.filter(s => s.mode === 'hybrid').length} HYBRID &nbsp;|&nbsp; {steps.filter(s => s.mode === 'human').length} HUMAN
        </span>
        <span className="font-mono-data text-led-green text-[12px]">
          PIPELINE: OPERATIONAL
        </span>
      </div>
    </div>
  );
}
