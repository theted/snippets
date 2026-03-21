import React, { useState, useEffect } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_MAP } from '../config';
import Button from './Button';
import CodeEditor from './CodeEditor';
import { GlassPanel, GlassInput, GlassTextarea, GlassInputWrap } from 'glass-design-system';
import { SnippetFormSchema, SnippetFormValues } from '../types';

const languages = AVAILABLE_LANGUAGES.map((lang) => ({
  label: LANGUAGE_MAP[lang as keyof typeof LANGUAGE_MAP] ?? lang,
  value: lang,
}));

type InputChangeEvent = React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

type FormField = keyof SnippetFormValues;

const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.72rem', marginTop: '-0.25rem', fontWeight: 500, letterSpacing: '0.02em' }}>
            {message}
        </p>
    ) : null;

function getErrors(values: SnippetFormValues) {
    const result = SnippetFormSchema.safeParse(values);
    if (result.success) return {} as Partial<Record<FormField, string>>;
    return Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
    ) as Partial<Record<FormField, string>>;
}

const EMPTY_FORM_STATE: SnippetFormValues = {
    title: '',
    content: '',
    description: '',
    language: DEFAULT_LANGUAGE,
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const classes = {
    // Two-column grid: code left (wider), metadata right.
    // On mobile the columns collapse to a single stack.
    grid: 'flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-10 lg:gap-14',

    // Left column — code: h-full so CodeEditor can flex-1 to fill
    codeCol: 'flex flex-col gap-4 md:gap-5 md:h-full',
    codeTextarea: 'flex-1 font-[var(--font-code)] text-sm leading-7 md:min-h-[32rem]',

    // Right column — self-start prevents it from stretching to grid row height
    metaCol: 'flex flex-col gap-7 md:justify-between md:self-start',

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
};

const SnippetForm: React.FC<Props> = ({
    defaultValues,
    isEditing = false,
    focusContent = false,
    onSubmit,
    closeModal,
}) => {
    const [formState, setFormState] = useState<SnippetFormValues>({
        ...EMPTY_FORM_STATE,
        ...defaultValues,
    });
    const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const errors = getErrors(formState);
    const visibleErrors = Object.fromEntries(
        Object.entries(errors).filter(([key]) => submitAttempted || touched[key as FormField])
    ) as Partial<Record<FormField, string>>;

    const inputHandler = (event: InputChangeEvent) => {
        const { name, value } = event.target;
        setFormState((currentState) => ({ ...currentState, [name]: value }));
    };

    const handleBlur = (field: FormField) => {
        setTouched((t) => ({ ...t, [field]: true }));
    };

    const handleCodeChange = (value: string) => {
        setFormState((currentState) => ({ ...currentState, content: value }));
    };

    const handleSubmit = () => {
        setSubmitAttempted(true);
        if (Object.keys(getErrors(formState)).length > 0) return;
        onSubmit(formState);
    };

    useEffect(() => {
        setFormState({ ...EMPTY_FORM_STATE, ...defaultValues });
        setTouched({});
        setSubmitAttempted(false);
    }, [defaultValues]);

    return (
        <GlassPanel
            as="form"
            onSubmit={(event: React.FormEvent) => {
                event.preventDefault();
                handleSubmit();
            }}
            onKeyDown={(event: React.KeyboardEvent) => {
                if (event.ctrlKey && event.key === 'Enter') {
                    event.preventDefault();
                    handleSubmit();
                }
            }}
            intensity="strong"
            topGlow
            rounded="rounded-[2.4rem]"
            className="relative z-30 w-full p-8 md:p-12 lg:p-14"
            style={{
                background: 'linear-gradient(160deg, oklch(0.19 0.024 254 / 0.68), oklch(0.15 0.018 255 / 0.72))',
            }}
        >

            <div className={classes.grid}>
                {/* ── LEFT: code ────────────────────────────────────── */}
                <div className={classes.codeCol}>
                    <label className={classes.label} htmlFor="snippet-content">
                        Code
                    </label>
                    <CodeEditor
                        id="snippet-content"
                        value={formState.content}
                        onChange={(value) => { handleCodeChange(value); handleBlur('content'); }}
                        language={formState.language}
                        autoFocus={focusContent}
                        minHeight="20rem"
                        maxHeight="800px"
                        height="100%"
                        className="flex-1 max-h-[800px]"
                        onSubmit={handleSubmit}
                    />
                    <FieldError message={visibleErrors.content} />
                </div>

                {/* ── RIGHT: header + metadata + actions ────────────── */}
                <div className={classes.metaCol}>
                    {/* Form heading */}
                    <div className={classes.header}>
                        <p className={classes.kicker}>
                            {isEditing ? 'Refine The Draft' : 'Add To The Library'}
                        </p>
                        <h1 className={classes.title}>{isEditing ? 'Edit' : 'Create'} snippet</h1>
                        <p className={classes.intro}>
                            Keep titles crisp and let the code block carry the story.
                        </p>
                    </div>

                    {/* Title */}
                    <div className={classes.fieldGroup}>
                        <label className={classes.label} htmlFor="snippet-title">
                            Title
                        </label>
                            <GlassInput
                            id="snippet-title"
                            name="title"
                            value={formState.title}
                            placeholder="Title"
                            onChange={inputHandler}
                            onBlur={() => handleBlur('title')}
                        />
                        <FieldError message={visibleErrors.title} />
                    </div>

                    {/* Description */}
                    <div className={classes.fieldGroup}>
                        <label className={classes.label} htmlFor="snippet-description">
                            Description
                        </label>
                            <GlassTextarea
                            id="snippet-description"
                            name="description"
                            placeholder="Description (optional)"
                            onChange={inputHandler}
                            onBlur={() => handleBlur('description')}
                            rows={4}
                            value={formState.description}
                        />
                        <FieldError message={visibleErrors.description} />
                    </div>

                    {/* Language */}
                    <div className={classes.fieldGroup}>
                        <label className={classes.label} htmlFor="snippet-language">
                            Language
                        </label>
                            <GlassInputWrap>
                            <select
                                id="snippet-language"
                                name="language"
                                value={formState.language}
                                onChange={inputHandler}
                                onBlur={() => handleBlur('language')}
                                className="block w-full appearance-none bg-transparent px-5 py-4 text-base leading-normal text-[var(--color-text)] focus:outline-none md:px-6 md:py-5 md:text-lg"
                            >
                                {languages.map(({ label, value }) => (
                                    <option key={value} value={value} style={{ background: 'oklch(0.14 0.02 254)' }}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </GlassInputWrap>
                        <FieldError message={visibleErrors.language} />
                    </div>

                    {/* Actions */}
                    <div className={classes.actions}>
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
            </div>
        </GlassPanel>
    );
};

export default SnippetForm;
