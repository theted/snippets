import React, { useState, useEffect } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config';
import Textfield from './Textfield';
import Textarea from './Textarea';
import Dropdown from './Dropdown';
import Button from './Button';
import { SnippetFormValues } from '../types';

const languages = AVAILABLE_LANGUAGES.map((lang) => ({ label: lang, value: lang }));

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const EMPTY_FORM_STATE: SnippetFormValues = {
  title: '',
  content: '',
  description: '',
  language: DEFAULT_LANGUAGE,
};

const classes = {
  form: 'relative z-30 block w-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 backdrop-blur-2xl md:p-8 lg:p-10',
  kicker: 'text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]',
  title: 'mt-3 font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-5xl',
  intro: 'max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] md:text-base',
  section: 'mt-8 space-y-3',
  label: 'text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]',
  actions: 'mt-10 flex flex-wrap gap-4',
};

type Props = {
  defaultValues?: Partial<SnippetFormValues>;
  isEditing?: boolean;
  onSubmit: (values: SnippetFormValues) => void;
  closeModal: () => void;
}

const SnippetForm: React.FC<Props> = ({
  defaultValues, isEditing = false, onSubmit, closeModal,
}) => {
  const [formState, setFormState] = useState<SnippetFormValues>({
    ...EMPTY_FORM_STATE,
    ...defaultValues,
  });

  const inputHandler = (event: InputChangeEvent) => {
    const { name, value } = event.target;
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
      <div>
        <p className={classes.kicker}>{isEditing ? 'Refine The Draft' : 'Add To The Library'}</p>
        <h1 className={classes.title}>
          {isEditing ? 'Edit' : 'Create'}
          {' '}
          snippet
        </h1>
        <p className={classes.intro}>
          Use the generous canvas to shape a snippet that is easy to revisit later.
          Keep titles crisp and let the code block carry the story.
        </p>
      </div>
      <div className={classes.section}>
        <label className={classes.label} htmlFor="snippet-title">Title</label>
        <Textfield
          id="snippet-title"
          name="title"
          value={formState.title}
          placeholder="Title"
          onChange={inputHandler}
          className="text-lg md:text-xl"
        />
      </div>
      <div className={classes.section}>
        <label className={classes.label} htmlFor="snippet-content">Code</label>
        <Textarea
          id="snippet-content"
          name="content"
          placeholder="Content"
          onChange={inputHandler}
          rows={15}
          value={formState.content}
        />
      </div>
      <div className={classes.section}>
        <label className={classes.label} htmlFor="snippet-description">Description</label>
        <Textarea
          id="snippet-description"
          name="description"
          placeholder="Description (optional)"
          onChange={inputHandler}
          rows={5}
          value={formState.description}
          className="min-h-[10rem]"
        />
      </div>
      <div className={classes.section}>
        <label className={classes.label} htmlFor="snippet-language">Language</label>
        <Dropdown
          id="snippet-language"
          name="language"
          options={languages}
          value={formState.language}
          onChange={inputHandler}
          className="md:max-w-sm"
        />
      </div>
      <div className={classes.actions}>
        <Button
          variant={isEditing ? 'info' : 'success'}
          type="submit"
          className="min-w-[12rem]"
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="warning"
          onClick={closeModal}
          className="min-w-[12rem]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SnippetForm;
