export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? 'development';

export const EXPERIMENTAL_BACKGROUND = import.meta.env.VITE_EXPERIMENTAL_BACKGROUND === 'true';

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3200';

export const GOOGLE_AUTH_ENABLED = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export const AVAILABLE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'csharp',
  'css',
  'go',
  'dockerfile',
  'php',
  'haml',
  'less',
  'sass',
  'stylus',
  'markdown',
  'plaintext',
  'sql',
  'yaml',
];

export const LANGUAGE_MAP = {
  javascript: 'Javascript',
  typescript: 'Typescript',
  python: 'Python',
  csharp: 'C#',
  css: 'CSS',
  go: 'Go',
  dockerfile: 'Dockerfile',
  php: 'PHP',
  haml: 'HAML',
  less: 'LESS',
  sass: 'SASS',
  stylus: 'Stylus',
  markdown: 'Markdown',
  plaintext: 'Text',
  sql: 'SQL',
  yaml: 'YAML',
};

export const DEFAULT_LANGUAGE = 'javascript';

export const THEMES = [
  'a11yDark',
  'a11yLight',
  'agate',
  'anOldHope',
  'androidstudio',
  'arduinoLight',
  'arta',
  'ascetic',
  'atelierCaveDark',
  'atelierCaveLight',
  'atelierDuneDark',
  'atelierDuneLight',
  'atelierEstuaryDark',
  'atelierEstuaryLight',
  'atelierForestDark',
  'atelierForestLight',
  'atelierHeathDark',
  'atelierHeathLight',
  'atelierLakesideDark',
  'atelierLakesideLight',
  'atelierPlateauDark',
  'atelierPlateauLight',
  'atelierSavannaDark',
  'atelierSavannaLight',
  'atelierSeasideDark',
  'atelierSeasideLight',
  'atelierSulphurpoolDark',
  'atelierSulphurpoolLight',
  'atomOneDark',
  'atomOneDarkReasonable',
  'atomOneLight',
  'brownPaper',
  'codepenEmbed',
  'colorBrewer',
  'darcula',
  'dark',
  'defaultStyle',
  'docco',
  'dracula',
  'far',
  'foundation',
  'github',
  'githubGist',
  'gml',
  'googlecode',
  'gradientDark',
  'gradientLight',
  'grayscale',
  'gruvboxDark',
  'gruvboxLight',
  'hopscotch',
  'hybrid',
  'idea',
  'irBlack',
  'isblEditorDark',
  'isblEditorLight',
  'kimbieDark',
  'kimbieLight',
  'lightfair',
  'lioshi',
  'magula',
  'monoBlue',
  'monokai',
  'monokaiSublime',
  'nightOwl',
  'nnfx',
  'nnfxDark',
  'nord',
  'obsidian',
  'ocean',
  'paraisoDark',
  'paraisoLight',
  'pojoaque',
  'purebasic',
  'qtcreatorDark',
  'qtcreatorLight',
  'railscasts',
  'rainbow',
  'routeros',
  'schoolBook',
  'shadesOfPurple',
  'solarizedDark',
  'solarizedLight',
  'srcery',
  'stackoverflowDark',
  'stackoverflowLight',
  'sunburst',
  'tomorrow',
  'tomorrowNight',
  'tomorrowNightBlue',
  'tomorrowNightBright',
  'tomorrowNightEighties',
  'vs',
  'vs2015',
  'xcode',
  'xt256',
  'zenburn',

  // hand-picked themes:
  // [...]
];

export const DEFAULT_THEME = 'vs2015';

export const TRANSITION_TIME = 300;

// ── Snippet stream layout ──────────────────────────────────────────────────────
// 'stream'  — full-width cards stacked vertically (original, editorial feel)
// 'grid'    — 2–3 column CSS grid, compact cards, more snippets per screen
// 'masonry' — CSS multi-column, compact cards, natural per-item height
// 'cascade' — repeating 1 → 2 → 3 column rows, editorial rhythm
export type SnippetLayout = 'stream' | 'grid' | 'masonry' | 'cascade';
export const DEFAULT_SNIPPET_LAYOUT: SnippetLayout = 'grid';
