import React from 'react';
import { useNavigate } from 'react-router-dom';
import StackSection from '../components/StackSection';
import { slugify } from '../stackData';

// The tool stack, on its own page: it's for the technical reader, and on the
// landing page it pushed the projects out of sight.
export default function Stack() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto pr-2 page-enter">
      <div className="max-w-[1120px] px-2 lg:px-6 py-4 lg:py-6">
        <h1 className="font-vt323 text-phosphor-hot text-[2.75rem] sm:text-[3.5rem] leading-none mb-3 [text-shadow:0_0_8px_rgba(255,176,0,0.45)]">
          Stack
        </h1>
        <p className="font-plex-mono text-phosphor text-[0.875rem] leading-[1.6] max-w-[60ch] mb-10">
          The tools I build with. Hover or tap one to see what it does and which of my builds use it.
        </p>

        {/* Project links open that project's file on the home page. */}
        <StackSection onOpenBuild={(codename) => navigate(`/#${slugify(codename)}`)} />
      </div>
    </div>
  );
}
