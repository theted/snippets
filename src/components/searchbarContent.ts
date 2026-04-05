export type SearchbarResult = {
  id: number;
  title: string;
  language?: string;
};

export type SearchbarTitle = {
  kicker: string;
  headline: string;
};

export const SEARCHBAR_TITLES: SearchbarTitle[] = [
  { kicker: 'Curate The Archive', headline: 'Find the exact fragment you need.' },
  { kicker: 'Your Code Memory', headline: 'Write it once. Find it forever.' },
  { kicker: 'The Fragment Archive', headline: "Everything you've earned, in order." },
  { kicker: 'Search Everything', headline: 'The one line you half-remembered is in here.' },
  { kicker: 'Recall Anything', headline: 'Stop rewriting what you already solved.' },
  { kicker: 'The Quiet Library', headline: 'Dark, indexed, and always open.' },
  { kicker: 'Your Second Brain', headline: 'Code from six months ago, back in ten seconds.' },
  { kicker: 'All Your Fragments', headline: 'Organised the way your mind actually searches.' },
  { kicker: 'The Reference Layer', headline: 'Pull up the right pattern before the context vanishes.' },
  { kicker: 'Institutional Memory', headline: "Every trick you've learned. Nowhere to forget it." },
  { kicker: 'The Code Cellar', headline: 'Aged well. Always ready.' },
  { kicker: 'Preserved in Amber', headline: "Catch the good ones before they're gone." },
  { kicker: 'The Deep Stack', headline: 'Every hard-won solution, within reach.' },
  { kicker: 'Low Light, High Signal', headline: 'Everything useful. Nothing in the way.' },
  { kicker: 'The Long Game', headline: "The snippets you'll still reach for in three years." },
  { kicker: 'Zero Noise', headline: 'Just the code. Exactly what you need.' },
  { kicker: 'The Night Shift', headline: 'Still works at 2am when the syntax escapes you.' },
  { kicker: 'Scar Tissue', headline: 'Every bug you fixed. Every trick you earned.' },
  { kicker: 'Dark And Indexed', headline: 'The quieter the interface, the louder the code.' },
  { kicker: 'The Slow Accumulation', headline: 'Built snippet by snippet. Invaluable over time.' },
  { kicker: 'Pattern Recognition', headline: 'The code your hands know before your brain does.' },
  { kicker: 'The Good Stuff', headline: 'None of the noise. All of the parts that matter.' },
];

export const RESULTS_LIMIT = 10;

export const searchbarBoxShadows = {
  base: '0 8px 40px oklch(0.05 0.015 250 / 0.42), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)',
  hover:
    '0 0 0 1px oklch(0.65 0.15 240 / 0.14), 0 14px 52px oklch(0.05 0.015 250 / 0.56), inset 0 1px 0 oklch(0.88 0.12 228 / 0.26)',
  focus:
    '0 0 0 1px oklch(0.68 0.18 240 / 0.14), 0 20px 72px oklch(0.05 0.015 250 / 0.52), inset 0 1px 0 oklch(0.88 0.12 226 / 0.18)',
} as const;

export const TITLE_TEXT_SHADOW =
  '0 1px 0 oklch(0.98 0.006 255 / 0.26), 0 0 48px oklch(0.72 0.18 244 / 0.12)';

export const getRandomSearchbarTitle = () =>
  SEARCHBAR_TITLES[Math.floor(Math.random() * SEARCHBAR_TITLES.length)];
