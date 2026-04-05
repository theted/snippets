import { GlassInput, GlassInputWrap, GlassTextarea } from 'glass-design-system';
import Button from './Button';
import SnippetFormFieldError from './SnippetFormFieldError';
import {
  languageOptions,
  snippetFormClasses,
  type FormField,
  type InputChangeEvent,
  type SnippetFormErrors,
} from './snippetFormUtils';
import type { SnippetFormValues } from '../types';

type Props = {
  formState: SnippetFormValues;
  errors: SnippetFormErrors;
  isEditing: boolean;
  onInputChange: (event: InputChangeEvent) => void;
  onBlurField: (field: FormField) => void;
  closeModal: () => void;
};

const SnippetFormMetaFields = ({
  formState,
  errors,
  isEditing,
  onInputChange,
  onBlurField,
  closeModal,
}: Props) => (
  <div className={snippetFormClasses.metaCol}>
    <div className={snippetFormClasses.header}>
      <p className={snippetFormClasses.kicker}>
        {isEditing ? 'Refine The Draft' : 'Add To The Library'}
      </p>
      <h1 className={snippetFormClasses.title}>{isEditing ? 'Edit' : 'Create'} snippet</h1>
      <p className={snippetFormClasses.intro}>
        Keep titles crisp and let the code block carry the story.
      </p>
    </div>

    <div className={snippetFormClasses.fieldGroup}>
      <label className={snippetFormClasses.label} htmlFor="snippet-title">
        Title
      </label>
      <GlassInput
        id="snippet-title"
        name="title"
        value={formState.title}
        placeholder="Title"
        onChange={onInputChange}
        onBlur={() => onBlurField('title')}
      />
      <SnippetFormFieldError message={errors.title} />
    </div>

    <div className={snippetFormClasses.fieldGroup}>
      <label className={snippetFormClasses.label} htmlFor="snippet-description">
        Description
      </label>
      <GlassTextarea
        id="snippet-description"
        name="description"
        placeholder="Description (optional)"
        onChange={onInputChange}
        onBlur={() => onBlurField('description')}
        rows={4}
        value={formState.description}
      />
      <SnippetFormFieldError message={errors.description} />
    </div>

    <div className={snippetFormClasses.fieldGroup}>
      <label className={snippetFormClasses.label} htmlFor="snippet-language">
        Language
      </label>
      <GlassInputWrap>
        <select
          id="snippet-language"
          name="language"
          value={formState.language}
          onChange={onInputChange}
          onBlur={() => onBlurField('language')}
          className="block w-full appearance-none bg-transparent px-5 py-4 text-base leading-normal text-[var(--color-text)] focus:outline-none md:px-6 md:py-5 md:text-lg"
        >
          {languageOptions.map(({ label, value }) => (
            <option
              key={value}
              value={value}
              style={{ background: 'oklch(0.14 0.02 254)' }}
            >
              {label}
            </option>
          ))}
        </select>
      </GlassInputWrap>
      <SnippetFormFieldError message={errors.language} />
    </div>

    <div className={snippetFormClasses.actions}>
      <Button variant="success" type="submit" className="min-w-[10rem]">
        {isEditing ? 'Update' : 'Create'}
      </Button>
      <Button
        type="button"
        variant="warning"
        onClick={closeModal}
        className="min-w-[10rem]"
      >
        Cancel
      </Button>
    </div>
  </div>
);

export default SnippetFormMetaFields;
