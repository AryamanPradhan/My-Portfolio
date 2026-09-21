/**
 * The tools in the Stack section, and the builds each one was used in.
 *
 * `usedIn` is derived, never written by hand: a tool lists a project only if
 * that project's `tech` array in portfolioData.json names it (via `tech`
 * below). So a tool can't claim a build it wasn't part of, and adding a
 * project wires it into the stack for free.
 */

import data from './portfolioData.json';
import { TECH_ICONS } from './techIcons';

/** @typedef {'ai' | 'data' | 'infra' | 'web'} StackGroup */

/**
 * @typedef {object} Build
 * @property {string} name      Short display name, sentence case
 * @property {string} codename  Key into portfolioData.projects
 * @property {string} slug      URL-safe form of the codename
 */

/**
 * @typedef {object} Tool
 * @property {string} name          The tool's real name, as normally written
 * @property {string} slug
 * @property {StackGroup} group
 * @property {string} description   One plain sentence on what the tool does
 * @property {Build[]} usedIn       Empty when no build lists the tool yet
 * @property {{ type: 'brand', path: string } | { type: 'symbol', name: string }} icon
 */

/** @type {StackGroup[]} */
export const STACK_GROUPS = ['ai', 'data', 'infra', 'web'];

/** @type {Record<StackGroup, string>} */
export const STACK_GROUP_LABELS = {
  ai: 'AI',
  data: 'Data',
  infra: 'Infrastructure',
  web: 'Web',
};

// Codenames are all-caps dossier labels; the stack speaks in sentence case.
const BUILD_NAMES = {
  'AI ASSISTED ONBOARDING SYSTEM': 'Client onboarding',
  'HOTEL AI GUIDE': 'Hotel AI Guide',
  'CONTENT GENERATION SYSTEM': 'Football content pipeline',
  'SPEED-TO-LEAD': 'Speed to Lead',
  'COLD OUTREACH': 'Cold outreach',
  'GLASS HOTEL': 'Glass Hotel',
  ARYAMAN_OS: 'This portfolio',
};

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// `tech` holds the strings projects use for this tool; `icon` is its key in TECH_ICONS.
const TOOLS = [
  { group: 'ai', name: 'Claude', tech: ['Claude API'], icon: 'Claude API',
    description: "Anthropic's language model, called directly for drafting, classifying and reasoning over text." },
  { group: 'ai', name: 'OpenAI', tech: ['OpenAI API'], icon: 'OpenAI API',
    description: "OpenAI's model API, used for generating, rewriting and grading text." },
  { group: 'ai', name: 'Cohere Rerank', tech: ['Cohere Rerank'], icon: 'Cohere Rerank',
    description: 'A reranking model that scores how well each retrieved passage answers the question.' },
  { group: 'ai', name: 'LangChain', tech: ['LangChain'], icon: 'LangChain',
    description: 'A framework for wiring models, prompts, tools and retrieval into one pipeline.' },
  { group: 'ai', name: 'LangGraph', tech: ['LangGraph'], icon: 'LangGraph',
    description: 'Builds agents as graphs of steps, with state, branching and a human in the loop.' },
  { group: 'ai', name: 'Hugging Face', tech: ['Hugging Face'], icon: 'Hugging Face',
    description: 'The hub for open models and datasets, and the libraries that run them.' },
  { group: 'ai', name: 'Gemini Embeddings', tech: ['Gemini Embeddings'], icon: 'Gemini Embeddings',
    description: "Google's embedding model, which turns text into vectors so search matches meaning, not just words." },
  { group: 'ai', name: 'NeMo Guardrails', tech: ['NeMo Guardrails'], icon: 'NeMo Guardrails',
    description: "NVIDIA's toolkit for putting rules around a model: what it won't discuss, and checks on what goes in and out." },
  { group: 'ai', name: 'DeepEval', tech: ['DeepEval'], icon: 'DeepEval',
    description: 'A test framework that scores model output against written criteria before it ships.' },

  { group: 'data', name: 'Qdrant', tech: ['Qdrant'], icon: 'Qdrant',
    description: 'A vector database that runs dense and keyword search over the same documents.' },
  { group: 'data', name: 'Supabase', tech: ['Supabase'], icon: 'Supabase',
    description: 'Postgres with auth, storage and an instant API on top, hosted and ready to use.' },
  { group: 'data', name: 'SQLite', tech: ['SQLite'], icon: 'SQLite',
    description: 'A whole SQL database in a single file, with no server to run.' },
  { group: 'data', name: 'PostgreSQL', tech: ['PostgreSQL'], icon: 'PostgreSQL',
    description: 'A relational database for when many writers and real volume arrive.' },
  { group: 'data', name: 'Tavily', tech: ['Tavily'], icon: 'Tavily',
    description: 'A search API that returns clean, sourced web results for a model to read.' },
  { group: 'data', name: 'Firecrawl', tech: ['Firecrawl'], icon: 'Firecrawl',
    description: "Crawls a website and returns its pages as clean text." },

  { group: 'infra', name: 'Python', tech: ['Python'], icon: 'Python',
    description: 'The language nearly every build here is written in.' },
  { group: 'infra', name: 'FastAPI', tech: ['FastAPI'], icon: 'FastAPI',
    description: 'A Python web framework for webhooks and streaming APIs.' },
  { group: 'infra', name: 'Django', tech: ['Django'], icon: 'Django',
    description: 'A full Python web framework with an admin, ORM and auth built in.' },
  { group: 'infra', name: 'Docker', tech: ['Docker'], icon: 'Docker',
    description: 'Packages a service and everything it needs into one image that runs the same anywhere.' },
  { group: 'infra', name: 'Render', tech: ['Render', 'Render Cron'], icon: 'Render',
    description: 'A hosting platform, used here to run scheduled jobs with no server left on.' },
  { group: 'infra', name: 'Railway', tech: ['Railway'], icon: 'Railway',
    description: 'Hosting for long-running services that need a disk that survives a restart.' },
  { group: 'infra', name: 'Vercel', tech: ['Vercel'], icon: 'Vercel',
    description: 'Hosting for frontends and serverless functions, deployed on every push.' },
  { group: 'infra', name: 'Git', tech: ['Git'], icon: 'Git',
    description: 'Version control, and the start of every deploy: a push triggers the build and ships it.' },
  { group: 'infra', name: 'Logfire', tech: ['Logfire'], icon: 'Logfire',
    description: 'Tracing for Python that shows every step, model call and what it cost.' },
  { group: 'infra', name: 'Bash', tech: ['Bash'], icon: 'Bash',
    description: 'The shell, for the scripts that glue everything else together.' },

  { group: 'web', name: 'React', tech: ['React'], icon: 'React',
    description: 'A library for building interfaces out of components.' },
  { group: 'web', name: 'Next.js', tech: ['Next.js'], icon: 'Next.js',
    description: 'A React framework for sites that need routing and fast static pages.' },
  { group: 'web', name: 'TypeScript', tech: ['TypeScript'], icon: 'TypeScript',
    description: 'JavaScript with types, checked before the code ever runs.' },
  { group: 'web', name: 'JavaScript', tech: ['JavaScript'], icon: 'JavaScript',
    description: 'The language every browser runs.' },
  { group: 'web', name: 'Vite', tech: ['Vite'], icon: 'Vite',
    description: 'A build tool with a dev server that reloads as fast as you save.' },
  { group: 'web', name: 'Tailwind CSS', tech: ['Tailwind CSS'], icon: 'Tailwind CSS',
    description: 'Utility classes for styling directly in the markup.' },
];

/** @type {Tool[]} */
export const STACK_TOOLS = TOOLS.map(({ tech, icon, ...tool }) => ({
  ...tool,
  slug: slugify(tool.name),
  icon: TECH_ICONS[icon],
  usedIn: data.projects
    .filter((p) => p.tech.some((t) => tech.includes(t)))
    .map((p) => ({ name: BUILD_NAMES[p.codename] ?? p.name, codename: p.codename, slug: slugify(p.codename) })),
}));
