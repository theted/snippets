import { useContext, useEffect, useState, useTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet, useSnippetNeighbors } from '../hooks/react-query';
import type { SnippetFormValues, SnippetId } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';
import Toast from '../components/Toast';
import SnippetPageToolbar from './snippet-page/SnippetPageToolbar';
import useSnippetPageMutations from './snippet-page/useSnippetPageMutations';
import useSnippetPageNavigation from './snippet-page/useSnippetPageNavigation';
import {
  getSnippetDetailWidth,
  snippetPageClasses,
} from './snippet-page/snippetPageUtils';

const parseSnippetId = (id: string | undefined): SnippetId | null => {
  const parsedId = Number(id);

  return Number.isFinite(parsedId) ? parsedId : null;
};

const SnippetPage = () => {
  const { id } = useParams<{ id: string }>();
  const snippetId = parseSnippetId(id);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [, startTransition] = useTransition();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const { data: snippet, isPending, error } = useSnippet(snippetId);
  const { prevId, nextId, prefetchIds } = useSnippetNeighbors(snippetId);
  const {
    contentRef,
    enterClass,
    linkCopied,
    copyLink,
    navigateBack,
    navigateTo,
  } = useSnippetPageNavigation({
    isEditing,
    prevId,
    nextId,
    prefetchIds,
    queryClient,
    navigate,
    startTransition,
  });
  const {
    updateSnippet,
    updateError,
    resetUpdate,
    deleteSnippet,
    deleteError,
    resetDelete,
  } = useSnippetPageMutations({
    snippetId,
    snippet,
    queryClient,
    navigate,
    setIsEditing,
    contentRef,
  });

  useEffect(() => {
    if (snippet) {
      document.title = `${snippet.title} · Snippets`;
    }

    return () => {
      document.title = 'Snippets';
    };
  }, [snippet]);

  const handleFilterLanguage = (language: string) => {
    navigate(`/language/${language}`);
  };

  const handleSubmit = (formValues: SnippetFormValues) => {
    updateSnippet(formValues);
  };

  return (
    <div className="App">
      <div className={snippetPageClasses.shell}>
        <SnippetPageToolbar
          linkCopied={linkCopied}
          prevId={prevId}
          nextId={nextId}
          onBack={() => {
            void navigateBack();
          }}
          onCopyLink={() => {
            void copyLink();
          }}
          onNavigatePrev={() => {
            if (prevId !== null) {
              void navigateTo(prevId, 'prev');
            }
          }}
          onNavigateNext={() => {
            if (nextId !== null) {
              void navigateTo(nextId, 'next');
            }
          }}
        />

        <div ref={contentRef} className={`${snippetPageClasses.contentWrap} ${enterClass}`}>
          {isPending && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <SpinFigure />
            </div>
          )}

          {snippet && (
            <div style={{ width: getSnippetDetailWidth(snippet.content) }}>
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
                onFilterLanguage={handleFilterLanguage}
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
            onSubmit={handleSubmit}
            closeModal={() => setIsEditing(false)}
          />
        </Modal>
      )}

      {error instanceof Error && (
        <Toast
          variant="error"
          message={`Could not load snippet: ${error.message}`}
          onDismiss={() => {
            /* query manages its own error state */
          }}
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
