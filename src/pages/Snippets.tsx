/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { useContext, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import Snippet from '../components/Snippet';
import { Snippet as ISnippet } from '../types';
import { update, remove } from '../utils/api.ts';
import Searchbar from '../components/Searchbar';
import { SpinFigure } from '../components/Spinner';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { ThemeContext } from '../contexts/themeContext';
import { snippetKeys, useSnippet } from '../hooks/react-query';
import { useDebounce } from '../utils/utils';
import useReactQuery from '../hooks/useReactQuery';

const classes = {
  container: '',
};

async function removeSnippetCallback(id: string) {
  return remove('snippets', id);
}

async function updateSnippetCallback(data: ISnippet) {
  return update(`snippets/${data.id}`, data);
}

const Snippets: React.FC = () => {
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const { data: editingSnippetData }: any = useSnippet(editingId);
  const { mutate: removeSnippet } = useMutation({
    mutationFn: removeSnippetCallback,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.lists() });
      const previousSnippets = queryClient.getQueriesData<ISnippet[]>({
        queryKey: snippetKeys.lists(),
      });

      queryClient.setQueriesData<ISnippet[]>({ queryKey: snippetKeys.lists() }, (old = []) => old
        .filter((snippet) => snippet.id !== id));

      return { previousSnippets };
    },
    onError: (_error, _id, context) => {
      context?.previousSnippets.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.all });
    },
  });
  const { mutate: updateSnippetMutation } = useMutation({
    mutationFn: updateSnippetCallback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys.all });
    },
  });
  const debouncedSearchQuery = useDebounce(search, 600);
  const { data: snippets = [], isPending, error } = useReactQuery(debouncedSearchQuery);

  if (isPending) return <SpinFigure />;
  if (error instanceof Error) return `An error has occurred: ${error.message}`;
  if (error) return 'An unknown error has occurred';

  const onDelete = async (id: string) => {
    removeSnippet(id);
  };

  const onEdit = (id: string) => {
    setIsEditing(true);
    setEditingId(Number(id));
  };

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const closeModal = () => {
    setIsEditing(false);
  };

  const updateSnippet = (data: ISnippet) => {
    updateSnippetMutation(data);
    setIsEditing(false);
  };

  return (
    <div className={classes.container}>
      <Searchbar onSearch={onSearch} />

      {snippets.map((snippet) => (
        <Snippet
          key={snippet.id || Math.random()}
          id={snippet.id}
          title={snippet.title}
          description={snippet.description}
          content={snippet.content}
          language={snippet.language}
          onDelete={onDelete}
          onEdit={onEdit}
          theme={theme}
        />
      ))}

      {isEditing && (
        <Modal
          closeModal={closeModal}
        >
          {/* TODO: spinner while loading */}
          <SnippetForm
            defaultValues={editingSnippetData}
            isEditing
            onSubmit={updateSnippet}
            closeModal={closeModal}
          />
        </Modal>
      )}

    </div>
  );
};

export default Snippets;
