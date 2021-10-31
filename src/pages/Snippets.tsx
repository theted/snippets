/* eslint-disable max-len */
import React, { useContext, useState, FC } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import Snippet from '../components/Snippet';
import { Snippet as ISnippet } from '../types';
import { update, remove } from '../utils/api.ts';
import Searchbar from '../components/Searchbar';
import { SpinFigure } from '../components/Spinner';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet } from '../hooks/react-query';
import { useDebounce } from '../utils/utils';
import useReactQuery from '../hooks/useReactQuery';

const classes = {
  container: '',
};

async function removeSnippetCallback(id: string) {
  remove('snippets', id);
}

async function updateSnippetCallback(data: ISnippet) {
  update(`snippets/${data.id}`, data);
}

type TempType = {
  data: any;
  isLoading: boolean;
  error: any;
}

const Snippets: FC = () => {
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const { data: editingSnippetData }: any = useSnippet(editingId);
  const { mutate: removeSnippet } = useMutation(removeSnippetCallback, {
    onMutate: async (id) => {
      await queryClient.cancelQueries('snippets');
      const previousSnippets = queryClient.getQueryData('snippets');
      queryClient.setQueryData('snippets', (old: any) => old
        .filter((s) => s.id !== id));
      return previousSnippets;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('snippets');
    },
  });
  const { mutate: updateSnippetMutation } = useMutation(updateSnippetCallback, {
    onSuccess: () => {
      queryClient.invalidateQueries('snippets');
    },
  });
  const debouncedSearchQuery = useDebounce(search, 600);
  const { data: snippets = [], isLoading, error }: TempType = useReactQuery(debouncedSearchQuery);

  if (isLoading) return <SpinFigure />;
  if (error) return `An error has occurred: ${error.message}`;

  const onDelete = async (id: string) => {
    removeSnippet(id);
  };

  const onEdit = (id: string) => {
    setIsEditing(true);
    setEditingId(id);
  };

  const onSearch = (value: string) => {
    setSearch(value);
    // ^ TODO: update our search hook
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
        <Modal closeModal={closeModal}>
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
