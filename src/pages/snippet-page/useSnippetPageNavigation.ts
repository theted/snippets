import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { Snippet as SnippetRecord, SnippetId } from '../../types';
import { get } from '../../utils/api';
import { snippetKeys } from '../../hooks/react-query';
import {
  animateElement,
  consumeNavDirection,
  getEnterClassForDirection,
  isTypingElement,
  setHomeRestoreFlag,
  setSnippetNavDirection,
  type NavDirection,
} from './snippetPageUtils';

type TransitionStarter = (callback: () => void) => void;
type NavigateFn = (path: string) => void;

type Params = {
  isEditing: boolean;
  prevId: SnippetId | null;
  nextId: SnippetId | null;
  prefetchIds: SnippetId[];
  queryClient: QueryClient;
  navigate: NavigateFn;
  startTransition: TransitionStarter;
};

const useSnippetPageNavigation = ({
  isEditing,
  prevId,
  nextId,
  prefetchIds,
  queryClient,
  navigate,
  startTransition,
}: Params) => {
  const [enterClass] = useState(() =>
    getEnterClassForDirection(consumeNavDirection()),
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigatingRef = useRef(false);
  const linkResetTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (linkResetTimeoutRef.current !== null) {
        window.clearTimeout(linkResetTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const prefetchSnippet = (neighborId: SnippetId) =>
      queryClient.prefetchQuery({
        queryKey: snippetKeys.detail(neighborId),
        queryFn: () => get<SnippetRecord>(`snippets/${neighborId}`),
        staleTime: 60_000,
      });

    prefetchIds.forEach(prefetchSnippet);
  }, [prefetchIds, queryClient]);

  const navigateTo = useCallback(
    async (targetId: SnippetId, direction: NavDirection) => {
      if (isEditing || navigatingRef.current) {
        return;
      }

      navigatingRef.current = true;
      setSnippetNavDirection(direction);

      await animateElement(contentRef.current, {
        opacity: 0,
        x: direction === 'next' ? -40 : 40,
        duration: 0.12,
        ease: 'power2.in',
      });

      startTransition(() => {
        navigate(`/snippets/${targetId}`);
      });
    },
    [isEditing, navigate, startTransition],
  );

  const navigateBack = useCallback(async () => {
    if (isEditing || navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;

    await animateElement(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.1,
      ease: 'power2.in',
    });

    startTransition(() => {
      setHomeRestoreFlag();
      navigate('/');
    });
  }, [isEditing, navigate, startTransition]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);

    if (linkResetTimeoutRef.current !== null) {
      window.clearTimeout(linkResetTimeoutRef.current);
    }

    linkResetTimeoutRef.current = window.setTimeout(() => {
      setLinkCopied(false);
    }, 2_000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingElement(document.activeElement)) {
        return;
      }

      if (event.key === 'Escape' && !isEditing) {
        void navigateBack();
        return;
      }

      if (event.key === 'ArrowRight' && nextId !== null) {
        void navigateTo(nextId, 'next');
      }

      if (event.key === 'ArrowLeft' && prevId !== null) {
        void navigateTo(prevId, 'prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, navigateBack, navigateTo, nextId, prevId]);

  return {
    contentRef,
    enterClass,
    linkCopied,
    copyLink,
    navigateBack,
    navigateTo,
  };
};

export default useSnippetPageNavigation;
