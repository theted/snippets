import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { post } from '../utils/api.ts';
import Button from '../components/Button';
import SnippetForm from '../components/SnippetForm';
// eslint-disable-next-line import/no-named-as-default
import Modal from '../components/Modal';
import { CreateSnippet as CreateSnippetInput, Snippet, SnippetFormValues } from '../types';
import { invalidateSnippetQueries } from '../utils/snippetQueryCache';

const CreateSnippet: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const createSnippetMutation = useMutation({
    mutationFn: (data: CreateSnippetInput) => post<Snippet, CreateSnippetInput>('snippets', data),
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      setIsFormVisible(false);
    },
  });

  const closeModal = () => setIsFormVisible(false);

  const onSubmit = (formValues: SnippetFormValues) => {
    createSnippetMutation.mutate(formValues);
  };

  const openModal = () => setIsFormVisible(true);

  if (!isFormVisible) {
    return (
      <Button
        type="button"
        variant="success"
        onClick={openModal}
        className="min-w-[14rem] justify-center md:justify-start"
      >
        <i className="icon-plus" />
        <span>Create Snippet</span>
      </Button>
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
