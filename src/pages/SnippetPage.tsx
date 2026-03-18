import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet } from '../hooks/react-query';
import { update, remove } from '../utils/api.ts';
import { invalidateSnippetQueries } from '../utils/snippetQueryCache';
import { SnippetFormValues } from '../types';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
  back: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
  content: 'mt-10',
  error: 'rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 text-[var(--color-text)] backdrop-blur-2xl',
};

const SnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const snippetId = Number(id);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: snippet, isPending, error } = useSnippet(snippetId || null);

  const { mutate: updateSnippet } = useMutation({
    mutationFn: (formValues: SnippetFormValues) => update(
      `snippets/${snippetId}`,
      { ...snippet, ...formValues },
    ),
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      setIsEditing(false);
    },
  });

  const { mutate: deleteSnippet } = useMutation({
    mutationFn: () => remove('snippets', snippetId),
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
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

        <div className={`${classes.content} snippet-detail-enter`}>
          {isPending && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <SpinFigure />
            </div>
          )}

          {error instanceof Error && (
            <div className={classes.error}>
              {`Unable to load snippet: ${error.message}`}
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
    </div>
  );
};

export default SnippetPage;
