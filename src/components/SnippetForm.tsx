import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config';
import Textfield from './Textfield';
import Textarea from './Textarea';
import Dropdown from './Dropdown';
import Button from './Button';
import CodeEditor from './CodeEditor';
import { SnippetFormValues } from '../types';

const languages = AVAILABLE_LANGUAGES.map((lang) => ({ label: lang, value: lang }));

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const EMPTY_FORM_STATE: SnippetFormValues = {
  title: '',
  content: '',
  description: '',
  language: DEFAULT_LANGUAGE,
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const classes = {
  form: 'relative z-30 w-full overflow-hidden rounded-[2.4rem] p-8 backdrop-blur-2xl md:p-12 lg:p-14',
  // Two-column grid: code left (wider), metadata right.
  // On mobile the columns collapse to a single stack.
  grid: 'flex flex-col gap-8 md:grid md:grid-cols-[1.7fr_1fr] md:items-start md:gap-10 lg:gap-14',

  // Left column — code
  codeCol: 'flex flex-col gap-4 md:gap-5',
  codeTextarea: 'flex-1 font-[var(--font-code)] text-sm leading-7 md:min-h-[32rem]',

  // Right column — header + fields + actions
  metaCol: 'flex flex-col gap-7',

  // Form header (visible in right col on desktop, top of stack on mobile)
  header: 'pb-1',
  kicker: 'text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel',
  title: 'mt-2 font-[var(--font-display)] text-3xl font-[200] tracking-[-0.055em] text-[var(--color-text)] md:text-4xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_12px_oklch(0_0_0_/_0.28)]',
  intro: 'mt-3 max-w-sm text-sm leading-7 text-[var(--color-text-muted)]',

  // Individual field groups
  fieldGroup: 'flex flex-col gap-2.5',
  label: 'text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel',

  // Actions — pushed to the bottom of the right column on desktop
  actions: 'flex flex-wrap gap-3 md:pt-1',
};

// ─── Component ─────────────────────────────────────────────────────────────────

type Props = {
  defaultValues?: Partial<SnippetFormValues>;
  isEditing?: boolean;
  focusContent?: boolean;
  onSubmit: (values: SnippetFormValues) => void;
  closeModal: () => void;
}

const SnippetForm: React.FC<Props> = ({
  defaultValues, isEditing = false, focusContent = false, onSubmit, closeModal,
}) => {
  const [formState, setFormState] = useState<SnippetFormValues>({
    ...EMPTY_FORM_STATE,
    ...defaultValues,
  });
  const [mousePos, setMousePos] = useState({ x: 50, y: 20 });
  const [isHovered, setIsHovered] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const inputHandler = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  const handleCodeChange = (value: string) => {
    setFormState((currentState) => ({ ...currentState, content: value }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLFormElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  useEffect(() => {
    setFormState({
      ...EMPTY_FORM_STATE,
      ...defaultValues,
    });
  }, [defaultValues]);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formState);
      }}
      className={classes.form}
      style={{
        // Gradient border: last backgroundImage layer clips to border-box so
        // the 1px transparent border area shows the mouse-tracking gradient.
        border: '1px solid transparent',
        backgroundImage: `
          radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, oklch(0.54 0.16 245 / ${isHovered ? '0.18' : '0.08'}) 0%, transparent 58%),
          radial-gradient(ellipse at 85% 95%, oklch(0.36 0.1 255 / 0.12) 0%, transparent 44%),
          linear-gradient(oklch(0.17 0.022 254 / 0.52), oklch(0.17 0.022 254 / 0.52)),
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
            oklch(0.78 0.2 232 / ${isHovered ? '0.9' : '0.5'}),
            oklch(0.42 0.08 245 / ${isHovered ? '0.55' : '0.38'}) 50%,
            oklch(0.28 0.04 250 / 0.3) 100%)
        `,
        backgroundOrigin: 'padding-box, padding-box, padding-box, border-box',
        backgroundClip: 'padding-box, padding-box, padding-box, border-box',
        boxShadow: isHovered
          ? `0 32px 80px oklch(0.05 0.015 250 / 0.5), inset 0 1px 0 oklch(0.88 0.14 228 / 0.22)`
          : `0 16px 56px oklch(0.05 0.015 250 / 0.36), inset 0 1px 0 oklch(0.8 0.1 230 / 0.12)`,
        transition: 'box-shadow 500ms ease, backgroundImage 500ms ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top-edge glass shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${isHovered ? 'oklch(0.92 0.16 224 / 0.7)' : 'oklch(0.82 0.1 230 / 0.36)'}, transparent)`,
        }}
      />
      {/* Mouse-tracking reflective highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, oklch(0.86 0.1 228 / 0.11) 0%, transparent 52%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {/* Ambient corner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-4rem] top-[-3rem] h-56 w-56 rounded-full"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.16 240 / 0.22) 0%, transparent 70%)',
          filter: 'blur(28px)',
          transition: 'opacity 400ms ease',
          opacity: isHovered ? 0.9 : 0.5,
        }}
      />

      <div className={classes.grid}>
        {/* ── LEFT: code ────────────────────────────────────── */}
        <div className={classes.codeCol}>
          <label className={classes.label} htmlFor="snippet-content">Code</label>
          <CodeEditor
            id="snippet-content"
            value={formState.content}
            onChange={handleCodeChange}
            language={formState.language}
            autoFocus={focusContent}
            minHeight="32rem"
          />
        </div>

        {/* ── RIGHT: header + metadata + actions ────────────── */}
        <div className={classes.metaCol}>
          {/* Form heading */}
          <div className={classes.header}>
            <p className={classes.kicker}>{isEditing ? 'Refine The Draft' : 'Add To The Library'}</p>
            <h1 className={classes.title}>
              {isEditing ? 'Edit' : 'Create'}
              {' '}
              snippet
            </h1>
            <p className={classes.intro}>
              Keep titles crisp and let the code block carry the story.
            </p>
          </div>

          {/* Title */}
          <div className={classes.fieldGroup}>
            <label className={classes.label} htmlFor="snippet-title">Title</label>
            <Textfield
              id="snippet-title"
              name="title"
              value={formState.title}
              placeholder="Title"
              onChange={inputHandler}
            />
          </div>

          {/* Description */}
          <div className={classes.fieldGroup}>
            <label className={classes.label} htmlFor="snippet-description">Description</label>
            <Textarea
              id="snippet-description"
              name="description"
              placeholder="Description (optional)"
              onChange={inputHandler}
              rows={4}
              value={formState.description}
            />
          </div>

          {/* Language */}
          <div className={classes.fieldGroup}>
            <label className={classes.label} htmlFor="snippet-language">Language</label>
            <Dropdown
              id="snippet-language"
              name="language"
              options={languages}
              value={formState.language}
              onChange={inputHandler}
            />
          </div>

          {/* Actions */}
          <div className={classes.actions}>
            <Button
              variant="success"
              type="submit"
              className="min-w-[10rem]"
            >
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
      </div>
    </form>
  );
};

export default SnippetForm;
