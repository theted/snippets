import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet, useSnippetNeighbors, snippetKeys } from '../hooks/react-query';
import { update, remove } from '../utils/api.ts';
import { invalidateSnippetQueries } from '../utils/snippetQueryCache';
import { Snippet as ISnippet, SnippetFormValues, SnippetId } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { computeCardWidth } from '../utils/snippetLayout';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';
import Toast from '../components/Toast';

// ── Direction bridging across navigation ──────────────────────────────────────
// sessionStorage survives the React unmount/remount that happens on navigation,
// but resets on tab close (unlike localStorage). It is read synchronously on
// the very first render — before any effect runs — so the enter-animation class
// is applied before the browser paints the new page.

type NavDirection = 'prev' | 'next';
const NAV_DIRECTION_KEY = 'snippetNavDirection';

function consumeNavDirection(): NavDirection | null {
  const value = sessionStorage.getItem(NAV_DIRECTION_KEY) as NavDirection | null;
  if (value) sessionStorage.removeItem(NAV_DIRECTION_KEY);
  return value;
}

function enterClassForDirection(dir: NavDirection | null): string {
  if (dir === 'next') return 'snippet-detail-enter-from-right';
  if (dir === 'prev') return 'snippet-detail-enter-from-left';
  return 'snippet-detail-enter';
}

// ── Constants ─────────────────────────────────────────────────────────────────

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
  back: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
  navBtn: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:pointer-events-none',
  content: 'mt-10 flex flex-col justify-center',
  contentWrap: 'flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center',
};

// ── Component ─────────────────────────────────────────────────────────────────

const SnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const snippetId = Number(id);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  // Read & clear the direction flag before first paint so the correct
  // enter-animation class is set from the start (not swapped in via an effect).
  const [enterClass] = useState(() => enterClassForDirection(consumeNavDirection()));

  const { data: snippet, isPending, error } = useSnippet(snippetId || null);
  const { prevId, nextId, prefetchIds } = useSnippetNeighbors(snippetId || null);

  const contentRef = useRef<HTMLDivElement>(null);
  const exitTweenRef = useRef<gsap.core.Tween | null>(null);
  // Prevents a second keypress from firing while the exit animation is running.
  const navigatingRef = useRef(false);

  // ── Prefetch neighbors ──────────────────────────────────────────────────────
  // Cache both adjacent snippets as soon as their IDs are known so navigation
  // is instant (the detail query resolves from cache, not the network).
  //
  // When the archive is paginated and useSnippetNeighbors switches to an API
  // call, the prefetch calls below are unchanged — only the IDs come from a
  // different source.
  useEffect(() => {
    const prefetch = (neighborId: SnippetId) => queryClient.prefetchQuery({
      queryKey: snippetKeys.detail(neighborId),
      queryFn: () => import('../utils/api.ts').then(({ get: apiGet }) =>
        apiGet<ISnippet>(`snippets/${neighborId}`)),
      staleTime: 60_000,
    });

    prefetchIds.forEach(prefetch);
  }, [prefetchIds, queryClient]);

  // ── Animated navigation ─────────────────────────────────────────────────────
  const navigateTo = useCallback((targetId: SnippetId, direction: NavDirection) => {
    if (isEditing || navigatingRef.current) return;
    navigatingRef.current = true;

    // Slide the current content toward the direction of travel, then navigate.
    // The new page reads NAV_DIRECTION_KEY and enters from the opposite side.
    const xOut = direction === 'next' ? -70 : 70;
    sessionStorage.setItem(NAV_DIRECTION_KEY, direction);

    gsap.to(contentRef.current, {
      opacity: 0,
      x: xOut,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => { navigate(`/snippets/${targetId}`); },
    });
  }, [isEditing, navigate]);

  // ── Keyboard handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active instanceof HTMLInputElement
        || active instanceof HTMLTextAreaElement
        || active instanceof HTMLSelectElement
        || (active instanceof HTMLElement && active.isContentEditable);
      if (isInput) return;

      if (e.key === 'Escape' && !isEditing) { navigate('/'); return; }
      if (e.key === 'ArrowRight' && nextId !== null) navigateTo(nextId, 'next');
      if (e.key === 'ArrowLeft'  && prevId !== null) navigateTo(prevId, 'prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditing, prevId, nextId, navigate, navigateTo]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const { mutate: updateSnippet, error: updateError, reset: resetUpdate } = useMutation({
    mutationFn: (formValues: SnippetFormValues) => update(
      `snippets/${snippetId}`,
      { ...snippet, ...formValues },
    ),
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      setIsEditing(false);
    },
  });

  const { mutate: deleteSnippet, error: deleteError, reset: resetDelete } = useMutation({
    mutationFn: () => remove('snippets', snippetId),
    onMutate: () => {
      if (contentRef.current) {
        exitTweenRef.current = gsap.to(contentRef.current, {
          opacity: 0,
          y: -20,
          filter: 'blur(8px)',
          duration: 0.45,
          ease: 'power3.in',
        });
      }
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      if (exitTweenRef.current) await exitTweenRef.current;
      navigate('/');
    },
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="App">
      <div className={classes.shell}>

        {/* Top bar: back link + prev/next navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className={classes.back}>
            <i className="icon-home" style={{ fontSize: '0.85em' }} />
            Back to archive
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={classes.navBtn}
              disabled={prevId === null}
              onClick={() => prevId !== null && navigateTo(prevId, 'prev')}
              title="Previous snippet (←)"
            >
              ← Older
            </button>
            <button
              type="button"
              className={classes.navBtn}
              disabled={nextId === null}
              onClick={() => nextId !== null && navigateTo(nextId, 'next')}
              title="Next snippet (→)"
            >
              Newer →
            </button>
          </div>
        </div>

        <div ref={contentRef} className={`${classes.contentWrap} ${enterClass}`}>
          {isPending && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <SpinFigure />
            </div>
          )}

          {snippet && (
            <div style={{ width: `min(${computeCardWidth(snippet.content)}px, 100%)` }}>
              <Snippet
                id={snippet.id}
                title={snippet.title}
                content={snippet.content}
                description={snippet.description}
                language={snippet.language}
                onDelete={() => deleteSnippet()}
                onEdit={() => setIsEditing(true)}
                theme={theme}
                forceAutoSize
                isFavorite={isFavorite(snippet.id)}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          )}
        </div>
      </div>

      {isEditing && snippet && (
        <Modal closeModal={() => setIsEditing(false)}>
          <SnippetForm
            defaultValues={snippet}
            isEditing
            onSubmit={updateSnippet}
            closeModal={() => setIsEditing(false)}
          />
        </Modal>
      )}

      {error instanceof Error && (
        <Toast
          variant="error"
          message={`Could not load snippet: ${error.message}`}
          onDismiss={() => { /* query manages its own error state */ }}
        />
      )}
      {updateError instanceof Error && (
        <Toast
          variant="error"
          message={`Save failed: ${updateError.message}`}
          onDismiss={resetUpdate}
        />
      )}
      {deleteError instanceof Error && (
        <Toast
          variant="error"
          message={`Delete failed: ${deleteError.message}`}
          onDismiss={resetDelete}
        />
      )}
    </div>
  );
};

export default SnippetPage;
