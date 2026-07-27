import React, { useState, useEffect, useRef } from 'react';
import data from '../portfolioData.json';

const { personal } = data;

const BOOT_LOGS = [
  "Initializing ARYAMAN_OS Kernel v4.1.0...",
  "Loading hardware abstraction layer (HAL)... [OK]",
  "Probing memory controllers... [OK]",
  "Found 64GB DDR5 ECC RAM at 0x00000000",
  "Initializing PCI Express bus...",
  "Found device: ARY-GFX-9000 at bus 0, slot 2",
  "Found device: ARY-NET-10G at bus 1, slot 0",
  "Loading storage drivers (NVMe/RAID)... [OK]",
  "Mounting encrypted root filesystem... [OK]",
  "Checking filesystem integrity... [CLEAN]",
  "Starting cryptographic subsystem...",
  "Loading AES-256 hardware acceleration... [OK]",
  "Initializing secure key vault... [OK]",
  "Starting network stack (eth0, eth1)...",
  "Acquiring secure tunnel on eth0... [ESTABLISHED]",
  "Starting intrusion detection daemon... [OK]",
  "Loading AI inference engine modules...",
  "Allocating tensor cores... [OK]",
  "Calibrating thermal management... [OK]",
  "Verifying security certificates... [VALID]",
  "Executing operator init scripts...",
  "Starting display compositor...",
  "Launching engineering workstation...",
];

const SUBSYSTEMS = [
  { id: 'core', label: 'CORE_LOGIC' },
  { id: 'crypto', label: 'CRYPTO_ENGINE' },
  { id: 'thermal', label: 'THERMAL_MGMT' },
  { id: 'io', label: 'I/O_BUS_ROUTE' },
];

export default function BootScreen({ onBootComplete }) {
  const [phase, setPhase] = useState('boot'); // boot -> welcome -> done
  const [logs, setLogs] = useState([]);
  const [subsystems, setSubsystems] = useState(
    SUBSYSTEMS.map(s => ({ ...s, progress: 0, status: 'WAITING' }))
  );
  const [currentSubsystem, setCurrentSubsystem] = useState(-1);
  const [showFlash, setShowFlash] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('aryaman-os-booted')) {
      onBootComplete();
      return;
    }

    let index = 0;
    const timers = [];

    const addLog = () => {
      if (index >= BOOT_LOGS.length) return;
      const timestamp = (performance.now() / 1000).toFixed(3);
      const id = index;
      setLogs(prev => [...prev, { text: `[${timestamp}] ${BOOT_LOGS[id]}`, id }]);
      index++;
      timers.push(setTimeout(addLog, Math.random() * 120 + 30));
    };

    timers.push(setTimeout(addLog, 400));
    timers.push(setTimeout(() => setCurrentSubsystem(0), 800));

    return () => {
      index = BOOT_LOGS.length;
      timers.forEach(clearTimeout);
      setLogs([]);
    };
  }, [onBootComplete]);

  useEffect(() => {
    if (currentSubsystem < 0 || currentSubsystem >= SUBSYSTEMS.length) return;
    if (currentSubsystem >= SUBSYSTEMS.length) return;

    setSubsystems(prev => prev.map((s, i) =>
      i === currentSubsystem ? { ...s, status: 'INIT...' } : s
    ));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setSubsystems(prev => prev.map((s, i) =>
        i === currentSubsystem ? { ...s, progress: Math.min(progress, 10) } : s
      ));
      if (progress >= 10) {
        clearInterval(interval);
        setSubsystems(prev => prev.map((s, i) =>
          i === currentSubsystem ? { ...s, status: 'ONLINE' } : s
        ));
        setTimeout(() => setCurrentSubsystem(prev => prev + 1), 200);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [currentSubsystem]);

  useEffect(() => {
    if (currentSubsystem >= SUBSYSTEMS.length) {
      setTimeout(() => setPhase('welcome'), 600);
    }
  }, [currentSubsystem]);

  useEffect(() => {
    if (phase === 'welcome') {
      setTimeout(() => {
        setShowFlash(true);
        setTimeout(() => {
          sessionStorage.setItem('aryaman-os-booted', 'true');
          onBootComplete();
        }, 600);
      }, 2000);
    }
  }, [phase, onBootComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[200] bg-background-matte flex items-center justify-center">
        <div className="crt-overlay"></div>
        <div className="scanline"></div>
        {showFlash && <div className="fixed inset-0 z-[999] bg-primary/80 boot-flash pointer-events-none"></div>}
        <div className="text-center animate-fade-in px-6">
          <h2 className="font-display-lg text-4xl md:text-5xl text-primary font-bold tracking-tight mb-3 drop-shadow-[0_0_20px_rgba(255,176,0,0.5)]">
            {personal.name.toUpperCase()}
          </h2>
          <div className="font-mono-data text-primary-container text-lg mb-4">{personal.title.toUpperCase()}</div>
          <div className="font-mono-data text-on-surface-variant max-w-lg mx-auto text-sm">{personal.tagline}</div>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-background-matte text-led-green overflow-hidden">
      <div className="crt-overlay"></div>
      <div className="scanline"></div>

      <div className="h-full p-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b-2 border-outline-variant pb-4">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary tracking-tighter">ARYAMAN_OS</h1>
            <div className="font-status-tiny text-status-tiny text-on-surface-variant uppercase mt-1">
              KERNEL v4.1.0 build 8892
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono-data text-mono-data text-led-green">SYS_CHECK_OK</div>
            <div className="font-status-tiny text-status-tiny text-on-surface-variant uppercase mt-1">MEM_ALLOC_READY</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-3 gap-8 min-h-0">
          {/* Terminal Output */}
          <div ref={terminalRef} className="col-span-2 bevel-inset bg-surface-container-lowest p-4 overflow-y-auto font-mono-data text-mono-data">
            {logs.map(log => (
              <div key={log.id} className="boot-log-line text-on-surface-variant mb-0.5">
                {log.text}
              </div>
            ))}
            <span className="cursor-block mt-1"></span>
          </div>

          {/* Subsystem Init */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bevel-panel p-4">
              <div className="font-label-caps text-label-caps text-on-surface mb-3 border-b border-outline-variant pb-2">
                SUBSYSTEM INIT
              </div>
              <div className="space-y-4">
                {subsystems.map((sys, i) => (
                  <div key={sys.id}>
                    <div className="flex justify-between font-mono-data text-mono-data mb-1">
                      <span className="text-on-surface-variant">{sys.label}</span>
                      <span className={`transition-opacity ${
                        sys.status === 'ONLINE' ? 'text-led-green' :
                        sys.status === 'INIT...' ? 'text-secondary-fixed-dim' :
                        'text-outline opacity-40'
                      }`}>
                        {sys.status}
                      </span>
                    </div>
                    <div className="boot-progress-bar">
                      {Array.from({ length: 10 }, (_, j) => (
                        <div key={j} className={`boot-progress-segment ${j < sys.progress ? 'active' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skip button */}
            <button
              onClick={() => {
                sessionStorage.setItem('aryaman-os-booted', 'true');
                onBootComplete();
              }}
              className="bevel-outset bg-surface-container-highest text-outline px-4 py-2 font-label-caps text-[13px] hover:text-primary hover:bg-surface-bright transition-all mt-auto"
            >
              SKIP BOOT SEQUENCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
