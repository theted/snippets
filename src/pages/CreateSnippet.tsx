/* eslint-disable no-console */

import React, { useState } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import { post } from '../utils/api.ts';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';

const CreateSnippet: React.FC = () => {
  const queryClient = useQueryClient();
  const [formvisible, setFormvisible] = useState<boolean>(false);
  // TODO: refactor into reusable helper util method
  const mutation = useMutation<any>((data) => post('snippets', data), {
    onMutate: async (newSnippet) => {
      await queryClient.cancelQueries('snippets');
      const previousSnippets = queryClient.getQueryData('snippets');
      queryClient.setQueryData('snippets', (old: any) => [newSnippet, ...old]);
      return previousSnippets;
    },
    onError: (err, data, context: any) => {
      console.log({ err, data, context });
      queryClient.setQueryData('snippets', context.currentSnippets);
    },
    onSettled: () => {
      console.log('Settled!');
      queryClient.invalidateQueries('snippets');
    },
  });

  const closeModal = () => {
    const allElemes = document.querySelectorAll('.form, .bg');

    allElemes.forEach((elem) => {
      elem.classList.remove('fadeIn');
      elem.classList.add('fadeOut');
    });

    setTimeout(() => {
      setFormvisible(false);
    }, 500);
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
