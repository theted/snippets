import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { post } from '../utils/api';
import Button from '../components/Button';
import SnippetForm from '../components/SnippetForm';
// eslint-disable-next-line import/no-named-as-default
import Modal from '../components/Modal';
import { CreateSnippet as CreateSnippetInput, Snippet, SnippetFormValues } from '../types';
import { invalidateSnippetQueries } from '../utils/snippetQueryCache';
import Toast from '../components/Toast';
import Icon from '../components/Icon';

export type CreateSnippetHandle = { open: () => void };

const CreateSnippet = forwardRef<CreateSnippetHandle>((_, ref) => {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const {
    mutate: createSnippet,
    error: createError,
    reset: resetCreate,
  } = useMutation({
    mutationFn: (data: CreateSnippetInput) => post<Snippet, CreateSnippetInput>('snippets', data),
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
    },
  });

  const closeModal = () => setIsFormVisible(false);

  const onSubmit = (formValues: SnippetFormValues) => {
    setIsFormVisible(false);
    createSnippet(formValues);
  };

  const openModal = () => setIsFormVisible(true);

  useImperativeHandle(ref, () => ({ open: openModal }));

  // Always render the button so the toolbar layout never shifts when the
  // modal opens — previously the button was replaced by the modal, causing
  // the toolbar to reflow (the main "yank" on open/close).
  return (
    <>
      <Button
        type="button"
        variant="success"
        onClick={openModal}
        className="min-w-[14rem] justify-center md:justify-start"
      >
        <Icon name="plus" />
        <span>Create Snippet</span>
      </Button>
      {isFormVisible && (
        <Modal closeModal={closeModal}>
          <SnippetForm
            onSubmit={onSubmit}
            closeModal={closeModal}
            focusContent
          />
        </Modal>
      )}
      {createError instanceof Error && (
        <Toast
          variant="error"
          message={`Could not save snippet: ${createError.message}`}
          onDismiss={resetCreate}
        />
      )}
    </>
  );
});

export default CreateSnippet;
