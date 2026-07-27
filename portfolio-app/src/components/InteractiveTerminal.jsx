import React, { useState, useRef, useEffect } from 'react';
import data from '../portfolioData.json';

const { personal, contact, services, stack, principles, projects } = data;

const pad = (str, len) => String(str).padEnd(len);

const COMMANDS = {
  help: () => [
    'Available commands:',
    '  help          — Show this help',
    '  whoami        — Who I am and what I do',
    '  ls projects   — List everything I have built',
    '  cat about.txt — Longer bio',
    '  services      — What I take on',
    '  stack         — Tools and languages I work in',
    '  principles    — How I build',
    '  contact       — How to reach me',
    '  clear         — Clear terminal',
    '  sudo rm -rf / — ???',
  ],
  whoami: () => [
    `NAME:     ${personal.name}`,
    `ROLE:     ${personal.title}`,
    `BASED:    ${personal.location}`,
    `CLIENTS:  ${personal.focus}`,
    `TERMS:    ${personal.engagement}`,
    `STATUS:   ${personal.availability}`,
  ],
  'ls projects': () => [
    ...projects.map(p => `  ${pad(p.codename, 16)}${pad(`[${p.type}]`, 24)}${p.status}`),
    '',
    `${projects.length} builds. Run the BUILD LOG page for full detail.`,
  ],
  'cat about.txt': () => [
    `${personal.name} — ${personal.title}`,
    '─────────────────────────────────────────',
    personal.bio,
    '',
  ],
  services: () => [
    'WHAT I TAKE ON',
    '─────────────────────────',
    ...services.flatMap(s => [`  ${s.name}`, `    ${s.desc}`, '']),
  ],
  stack: () => [
    'STACK',
    '─────────────────────────',
    ...stack.map(g => `  ${pad(g.category, 16)}${g.items.join(', ')}`),
    '',
  ],
  principles: () => [
    'HOW I BUILD',
    '─────────────────────────',
    ...principles.map(p => `  ▸ ${p}`),
  ],
  contact: () => [
    'CONTACT',
    '─────────────────────────',
    `  EMAIL     ${contact.email}`,
    `  GITHUB    ${contact.github}`,
    `  LINKEDIN  ${contact.linkedin}`,
    '',
    'Or use the CONTACT page to draft a message.',
  ],
  'sudo rm -rf /': () => [
    '',
    '  ╔═══════════════════════════════════════╗',
    '  ║  PERMISSION DENIED                    ║',
    '  ║                                       ║',
    '  ║  Nice try.                            ║',
    '  ║  Try "help" instead.                  ║',
    '  ╚═══════════════════════════════════════╝',
    '',
  ],
};

export default function InteractiveTerminal({ className = '' }) {
  const [history, setHistory] = useState([
    { type: 'system', text: 'ARYAMAN_OS Terminal v4.1.0' },
    { type: 'system', text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const newEntries = [{ type: 'input', text: `> ${input}` }];

    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    const handler = COMMANDS[cmd];
    if (handler) {
      handler().forEach(line => newEntries.push({ type: 'output', text: line }));
    } else {
      newEntries.push({ type: 'error', text: `Command not found: ${cmd}` });
      newEntries.push({ type: 'output', text: 'Type "help" for available commands.' });
    }

    setHistory(prev => [...prev, ...newEntries]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div
      className={`bevel-outset bg-background-matte flex flex-col overflow-hidden ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="h-6 bg-surface-steel flex items-center px-3 border-b-2 border-border-graphite flex-shrink-0">
        <span className="font-label-caps text-label-caps text-outline">TERMINAL // INTERACTIVE</span>
        <div className="w-1.5 h-1.5 bg-led-green led-pulse-green rounded-full ml-auto"></div>
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono-data text-[14px] leading-relaxed">
        {history.map((entry, i) => (
          <div key={i} className={
            entry.type === 'input' ? 'text-primary mb-0.5' :
            entry.type === 'error' ? 'text-led-red mb-0.5' :
            entry.type === 'system' ? 'text-primary-container mb-0.5' :
            'text-on-surface-variant mb-0.5'
          }>
            {entry.text || ' '}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center mt-1">
          <span className="text-led-green mr-1">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-primary font-mono-data text-[14px] p-0 m-0 focus:ring-0 focus:shadow-none caret-primary"
            style={{ boxShadow: 'none', border: 'none' }}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
