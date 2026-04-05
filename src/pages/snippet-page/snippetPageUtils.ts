import { gsap } from 'gsap';
import { computeCardWidth } from '../../utils/snippetLayout';

export type NavDirection = 'prev' | 'next';

const NAV_DIRECTION_KEY = 'snippetNavDirection';

export const snippetPageClasses = {
  shell:
    'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] pt-8 pb-[clamp(2rem,5vw,4rem)] md:pt-10',
  contentWrap: 'mt-10 flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center',
} as const;

export const consumeNavDirection = (): NavDirection | null => {
  const value = window.sessionStorage.getItem(NAV_DIRECTION_KEY) as NavDirection | null;

  if (value) {
    window.sessionStorage.removeItem(NAV_DIRECTION_KEY);
  }

  return value;
};

export const getEnterClassForDirection = (direction: NavDirection | null) => {
  if (direction === 'next') {
    return 'snippet-detail-enter-from-right';
  }

  if (direction === 'prev') {
    return 'snippet-detail-enter-from-left';
  }

  return 'snippet-detail-enter';
};

export const setSnippetNavDirection = (direction: NavDirection) => {
  window.sessionStorage.setItem(NAV_DIRECTION_KEY, direction);
};

export const setHomeRestoreFlag = () => {
  window.sessionStorage.setItem('homeRestore', '1');
};

export const isTypingElement = (activeElement: Element | null) =>
  activeElement instanceof HTMLInputElement ||
  activeElement instanceof HTMLTextAreaElement ||
  activeElement instanceof HTMLSelectElement ||
  (activeElement instanceof HTMLElement && activeElement.isContentEditable);

export const animateElement = async (
  element: HTMLElement | null,
  vars: gsap.TweenVars,
): Promise<void> =>
  new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const originalOnComplete = vars.onComplete;

    gsap.to(element, {
      ...vars,
      onComplete: () => {
        originalOnComplete?.();
        resolve();
      },
    });
  });

export const getSnippetDetailWidth = (content: string) =>
  `clamp(50%, ${computeCardWidth(content)}px, 100%)`;
