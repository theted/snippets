import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet } from '../hooks/react-query';
import { update, remove } from '../utils/api.ts';
import { invalidateSnippetQueries } from '../utils/snippetQueryCache';
import { SnippetFormValues } from '../types';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';
import Toast from '../components/Toast';

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
  back: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
  content: 'mt-10',
};

const SnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const snippetId = Number(id);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: snippet, isPending, error } = useSnippet(snippetId || null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exitTweenRef = useRef<gsap.core.Tween | null>(null);

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

  // Escape → back to archive (only when no modal is open)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditing) navigate('/');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditing, navigate]);

  return (
    <div className="App">
      <div className={classes.shell}>
        <Link to="/" className={classes.back}>
          <i className="icon-home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </Link>

        <div ref={contentRef} className={`${classes.content} snippet-detail-enter`}>
          {isPending && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <SpinFigure />
            </div>
          )}

          {snippet && (
            <Snippet
              id={snippet.id}
              title={snippet.title}
              content={snippet.content}
              description={snippet.description}
              language={snippet.language}
              onDelete={() => deleteSnippet()}
              onEdit={() => setIsEditing(true)}
              theme={theme}
            />
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

      {/* ── Error toasts ── */}
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
