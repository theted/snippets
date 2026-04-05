import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { GlassPanel } from 'glass-design-system';
import CodeEditor from './CodeEditor';
import SnippetFormFieldError from './SnippetFormFieldError';
import SnippetFormMetaFields from './SnippetFormMetaFields';
import type { SnippetFormValues } from '../types';
import {
  EMPTY_FORM_STATE,
  getFormErrors,
  getVisibleFormErrors,
  snippetFormClasses,
  type FormField,
  type InputChangeEvent,
} from './snippetFormUtils';

type Props = {
  defaultValues?: Partial<SnippetFormValues>;
  isEditing?: boolean;
  focusContent?: boolean;
  onSubmit: (values: SnippetFormValues) => void;
  closeModal: () => void;
};

const SnippetForm = ({
  defaultValues,
  isEditing = false,
  focusContent = false,
  onSubmit,
  closeModal,
}: Props) => {
  const [formState, setFormState] = useState<SnippetFormValues>({
    ...EMPTY_FORM_STATE,
    ...defaultValues,
  });
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = getFormErrors(formState);
  const visibleErrors = getVisibleFormErrors(errors, touched, submitAttempted);

  const handleInputChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name as FormField]: value,
    }));
  };

  const handleBlurField = (field: FormField) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
  };

  const handleCodeChange = (value: string) => {
    setFormState((currentState) => ({
      ...currentState,
      content: value,
    }));
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit(formState);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    setFormState({ ...EMPTY_FORM_STATE, ...defaultValues });
    setTouched({});
    setSubmitAttempted(false);
  }, [defaultValues]);

  return (
    <GlassPanel
      as="form"
      onSubmit={handleFormSubmit}
      onKeyDown={handleFormKeyDown}
      intensity="strong"
      topGlow
      rounded="rounded-[2.4rem]"
      className="relative z-30 w-full p-8 md:p-12 lg:p-14"
      style={{
        background:
          'linear-gradient(160deg, oklch(0.19 0.024 254 / 0.68), oklch(0.15 0.018 255 / 0.72))',
      }}
    >
      <div className={snippetFormClasses.grid}>
        <div className={snippetFormClasses.codeCol}>
          <label className={snippetFormClasses.label} htmlFor="snippet-content">
            Code
          </label>
          <CodeEditor
            id="snippet-content"
            value={formState.content}
            onChange={(value) => {
              handleCodeChange(value);
              handleBlurField('content');
            }}
            language={formState.language}
            autoFocus={focusContent}
            minHeight="20rem"
            maxHeight="800px"
            height="100%"
            className="flex-1 max-h-[800px]"
            onSubmit={handleSubmit}
          />
          <SnippetFormFieldError message={visibleErrors.content} />
        </div>

        <SnippetFormMetaFields
          formState={formState}
          errors={visibleErrors}
          isEditing={isEditing}
          onInputChange={handleInputChange}
          onBlurField={handleBlurField}
          closeModal={closeModal}
        />
      </div>
    </GlassPanel>
  );
};

export default SnippetForm;
