import React, { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export default function DecryptText({ text, delay = 0, speed = 30, className = '', as: Tag = 'span' }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const resolvedCount = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    resolvedCount.current = 0;
    const scrambled = text.split('').map(ch => (ch === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]));
    setDisplayed(scrambled.join(''));

    const interval = setInterval(() => {
      if (resolvedCount.current >= text.length) {
        clearInterval(interval);
        setDisplayed(text);
        return;
      }

      resolvedCount.current++;
      const next = text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < resolvedCount.current) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });
      setDisplayed(next.join(''));
    }, speed);

    return () => clearInterval(interval);
  }, [text, started, speed]);

  if (!started) return <Tag className={className}>&nbsp;</Tag>;

  return <Tag className={className}>{displayed}</Tag>;
}
