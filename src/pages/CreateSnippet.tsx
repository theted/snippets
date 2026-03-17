/* eslint-disable no-console */

import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { post } from '../utils/api.ts';
import { snippetKeys } from '../hooks/react-query';
import SnippetForm from '../components/SnippetForm';
// eslint-disable-next-line import/no-named-as-default
import Modal from '../components/Modal';
import { Snippet } from '../types';

const CreateSnippet: React.FC = () => {
  const queryClient = useQueryClient();
  const [formvisible, setFormvisible] = useState<boolean>(false);
  // TODO: refactor into reusable helper util method
  const mutation = useMutation({
    mutationFn: (data: Snippet) => post<Snippet>('snippets', data),
    onMutate: async (newSnippet) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.lists() });
      const previousSnippets = queryClient.getQueryData<Snippet[]>(snippetKeys.list(''));

      queryClient.setQueryData<Snippet[]>(snippetKeys.list(''), (old = []) => [newSnippet, ...old]);

      return { previousSnippets };
    },
    onError: (err, data, context: any) => {
      console.log({ err, data, context });
      queryClient.setQueryData(snippetKeys.list(''), context?.previousSnippets);
    },
    onSettled: () => {
      console.log('Settled!');
      queryClient.invalidateQueries({ queryKey: snippetKeys.all });
    },
  });

  const closeModal = () => {
    // TODO: use modal's close callback
    setFormvisible(false);
  };

  const onSubmit = (event) => {
    mutation.mutate(event);
    closeModal();
  };

  const toggleFormvisible = () => {
    if (formvisible) { closeModal(); } else {
      setFormvisible(true);
    }
  };

  // TODO: move out of component
  if (!formvisible) {
    return (
      <div>
        <button
          type="button"
          onClick={toggleFormvisible}
          className="text-white"
        >
          <i className="icon-plus" />
          <span>
            Create snippet
          </span>

        </button>
      </div>
    );
  }

  return (
    <Modal closeModal={closeModal}>
      <SnippetForm
        onSubmit={onSubmit}
        closeModal={closeModal}
      />
    </Modal>

  );
};

export default CreateSnippet;
