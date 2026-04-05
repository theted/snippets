import { useContext, useEffect, useRef, useState, useTransition, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GlassPanel } from 'glass-design-system';
import type { Snippet as SnippetRecord, SnippetFormValues, SnippetId } from '../types';
import Searchbar, { type SearchbarHandle } from '../components/Searchbar';
import { SpinFigure } from '../components/Spinner';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { ThemeContext } from '../contexts/themeContext';
import { snippetKeys, useSnippet, useSnippets } from '../hooks/react-query';
import { useDebounce } from '../utils/utils';
import Toast from '../components/Toast';
import { LANGUAGE_MAP, type SnippetLayout } from '../config';
import Chip from '../components/Chip';
import { useFavorites } from '../hooks/useFavorites';
import { useDeleteSnippetMutation, useUpdateSnippetMutation } from '../hooks/useSnippetMutations';
import SnippetLayoutToggle from './snippets/SnippetLayoutToggle';
import SnippetLayouts from './snippets/SnippetLayouts';
import {
  getSnippetEmptyStateMessage,
  getStoredSnippetLayout,
  markSnippetsLoaded,
  resetSnippetsLoaded,
} from './snippets/snippetLayoutUtils';

type Props = {
  searchbarRef?: RefObject<SearchbarHandle | null>;
  initialLanguage?: string;
};

export const _resetSnippetsLoaded = resetSnippetsLoaded;

const Snippets = ({ searchbarRef, initialLanguage }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const lastEditingIdRef = useRef<SnippetId | null>(null);
  const [editingId, setEditingId] = useState<SnippetId | null>(null);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string | null>(initialLanguage ?? null);
  const [isSearchTransitioning, startSearchTransition] = useTransition();
  const [layout, setLayout] = useState<SnippetLayout>(getStoredSnippetLayout);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [capturedEditError, setCapturedEditError] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveLayout: SnippetLayout = isMobile ? 'stream' : layout;
  const debouncedSearchQuery = useDebounce(search, 600);
  const hasSearchQuery = debouncedSearchQuery.trim().length > 0;
  const snippetsQuery = useSnippets({ language: languageFilter ?? undefined });
  const searchQuery = useSnippets(
    { q: hasSearchQuery ? debouncedSearchQuery : undefined },
    { enabled: hasSearchQuery },
  );

  const snippets = snippetsQuery.data ?? [];
  const error = snippetsQuery.error;
  const searchResults = searchQuery.data ?? [];
  const isSearching = Boolean(search);
  const isLoadingResults =
    (hasSearchQuery && searchQuery.isPending) ||
    isSearchTransitioning ||
    debouncedSearchQuery !== search;

  useEffect(() => {
    if (snippets.length > 0) {
      markSnippetsLoaded();
    }
  }, [snippets.length]);

  const prefetch = (id: SnippetId) => {
    queryClient.prefetchQuery({
      queryKey: snippetKeys.detail(id),
      queryFn: () => import('../utils/api').then(({ get }) => get<SnippetRecord>(`snippets/${id}`)),
      staleTime: 60_000,
    });
  };

  const { data: editingSnippetData, error: editingSnippetError } = useSnippet(editingId);
  const {
    mutate: removeSnippet,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteSnippetMutation();
  const {
    mutate: updateSnippetMutation,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateSnippetMutation({
    onMutate: () => {
      lastEditingIdRef.current = editingId;
      setEditingId(null);
    },
    onError: () => setEditingId(lastEditingIdRef.current),
  });

  useEffect(() => {
    if (editingSnippetError instanceof Error) {
      setCapturedEditError(editingSnippetError.message);
      setEditingId(null);
    }
  }, [editingSnippetError]);

  const handleLayoutChange = (nextLayout: SnippetLayout) => {
    setLayout(nextLayout);
    window.localStorage.setItem('snippetLayout', nextLayout);
  };

  const onDelete = (id: SnippetId) => {
    removeSnippet(id);
  };

  const onEdit = (id: SnippetId) => {
    setEditingId(id);
  };

  const onSearch = (value: string) => {
    setLanguageFilter(null);
    startSearchTransition(() => {
      setSearch(value);
    });
  };

  const closeModal = () => {
    setEditingId(null);
    resetUpdate();
    setCapturedEditError(null);
  };

  const onFilterLanguage = (language: string) => {
    navigate(`/language/${language}`);
  };

  const updateSnippet = (formValues: SnippetFormValues) => {
    if (!editingSnippetData) {
      return;
    }

    updateSnippetMutation({ ...editingSnippetData, ...formValues });
  };

  return (
    <section className="w-full">
      <Searchbar
        ref={searchbarRef}
        onSearch={onSearch}
        results={searchResults}
        isLoadingResults={isLoadingResults}
        isSearching={isSearching}
        debouncedQuery={debouncedSearchQuery}
      />

      {languageFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">
            Filtered by
          </span>
          <Chip
            variant="accent"
            size="md"
            onRemove={() => (initialLanguage ? navigate('/') : setLanguageFilter(null))}
          >
            {LANGUAGE_MAP[languageFilter as keyof typeof LANGUAGE_MAP] ?? languageFilter}
          </Chip>
        </div>
      )}

      {!isSearching && !isMobile && (
        <SnippetLayoutToggle layout={layout} onChange={handleLayoutChange} />
      )}

      {snippets.length === 0 ? (
        <p className="search-results-status mt-12" style={{ paddingTop: '1rem' }}>
          {getSnippetEmptyStateMessage(languageFilter)}
        </p>
      ) : (
        <SnippetLayouts
          snippets={snippets}
          layout={effectiveLayout}
          onDelete={onDelete}
          onEdit={onEdit}
          theme={theme}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onFilterLanguage={onFilterLanguage}
          prefetch={prefetch}
        />
      )}

      {editingId !== null && (
        <Modal closeModal={closeModal}>
          {editingSnippetData ? (
            <SnippetForm
              defaultValues={editingSnippetData}
              isEditing
              onSubmit={updateSnippet}
              closeModal={closeModal}
            />
          ) : (
            <GlassPanel intensity="medium" className="flex min-h-[12rem] items-center justify-center p-8">
              <div className="relative z-10">
                <SpinFigure />
              </div>
            </GlassPanel>
          )}
        </Modal>
      )}

      {error instanceof Error && (
        <Toast
          variant="error"
          message={`Could not load snippets: ${error.message}`}
          onDismiss={() => {
            /* query manages its own error state */
          }}
        />
      )}
      {deleteError instanceof Error && (
        <Toast
          variant="error"
          message="Delete failed — snippet was restored"
          onDismiss={resetDelete}
        />
      )}
      {capturedEditError && (
        <Toast
          variant="error"
          message={`Could not load snippet: ${capturedEditError}`}
          onDismiss={() => setCapturedEditError(null)}
        />
      )}
      {updateError instanceof Error && (
        <Toast
          variant="error"
          message={`Save failed: ${updateError.message}`}
          onDismiss={resetUpdate}
        />
      )}
    </section>
  );
};

export default Snippets;
