import React, { useState, useEffect } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config';
import Textfield from './Textfield';
import Textarea from './Textarea';
import Dropdown from './Dropdown';
import Button from './Button';
import { Snippet as ISnippet } from '../types';

const languages = AVAILABLE_LANGUAGES.map((lang) => ({ label: lang, value: lang }));

type FormData = Omit<ISnippet, 'id'>

const EMPTY_FORM_STATE: FormData = {
  title: '',
  content: '',
  description: '',
  language: DEFAULT_LANGUAGE,
};

const classes = {
  form: 'form block relative z-30 w-full max-w-2xl bg-gray-700 rounded-xl p-6 shadow-lg',
};

type Props = {
  defaultValues?: any;
  isEditing?: boolean;
  onSubmit: any; // () => void;
  closeModal: () => void;
}

const SnippetForm: React.FC<Props> = ({
  defaultValues, isEditing, onSubmit, closeModal,
}) => {
  const [formState, setFormState] = useState<FormData>({
    ...EMPTY_FORM_STATE,
    ...defaultValues,
  });

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  useEffect(() => {
    setFormState({
      ...EMPTY_FORM_STATE,
      ...defaultValues,
    });
  }, [defaultValues]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formState);
      }}
      className={classes.form}
    >
      <div className="m-4">
        <h1 className="text-white text-2xl mb-4">
          {isEditing ? 'Edit' : 'Create'}
          {' '}
          snippet
        </h1>
        <Textfield
          name="title"
          value={formState.title}
          placeholder="Title"
          onChange={inputHandler}
        />
      </div>
      <div className="m-4">
        <Textarea
          name="content"
          placeholder="Content"
          onChange={inputHandler}
          rows="15"
          value={formState.content}
        />
      </div>
      <div className="m-4">
        <Textarea
          name="description"
          placeholder="Description (optional)"
          onChange={inputHandler}
          rows="5"
          value={formState.description}
        />
      </div>
      <div className="m-4">
        <Dropdown
          name="language"
          options={languages}
          value={formState.language}
          onChange={inputHandler}
        />
      </div>
      <div className="m-4 mt-8">
        <Button
          variant={isEditing ? 'info' : 'success'}
          type="submit"
        >
          {isEditing ? 'Update' : 'Create'}

        </Button>
        <Button
          type="button"
          variant="warning"
          onClick={closeModal}
        >
          Cancel

        </Button>

      </div>
    </form>
  );
};

export default SnippetForm;
