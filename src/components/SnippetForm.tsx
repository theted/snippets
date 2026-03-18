import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config';
import Textfield from './Textfield';
import Textarea from './Textarea';
import Dropdown from './Dropdown';
import Button from './Button';
import CodeEditor from './CodeEditor';
import { SnippetFormValues } from '../types';

const languages = AVAILABLE_LANGUAGES.map((lang) => ({ label: lang, value: lang }));

type InputChangeEvent = React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

const EMPTY_FORM_STATE: SnippetFormValues = {
    title: '',
    content: '',
    description: '',
    language: DEFAULT_LANGUAGE,
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const classes = {
    form: 'relative z-30 w-full overflow-hidden rounded-[2.4rem] border border-[oklch(0.44_0.05_248_/_0.45)] bg-[oklch(0.17_0.022_254_/_0.97)] p-8 md:p-12 lg:p-14',
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
    const formRef = useRef<HTMLFormElement>(null);

    const inputHandler = (event: InputChangeEvent) => {
        const { name, value } = event.target;
        setFormState((currentState) => ({ ...currentState, [name]: value }));
    };

    const handleCodeChange = (value: string) => {
        setFormState((currentState) => ({ ...currentState, content: value }));
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
                border: '1px solid var(--color-border)',
                background: 'linear-gradient(160deg, oklch(0.19 0.024 254 / 0.88), oklch(0.15 0.018 255 / 0.92))',
                boxShadow: '0 16px 56px oklch(0.05 0.015 250 / 0.36), inset 0 1px 0 oklch(0.8 0.1 230 / 0.12)',
            }}
        >
            {/* Top-edge glass shimmer */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.22), transparent)' }}
            />
            {/* Ambient corner glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-4rem] top-[-3rem] h-56 w-56 rounded-full"
                style={{
                    background: 'radial-gradient(circle, oklch(0.72 0.16 240 / 0.22) 0%, transparent 70%)',
                    filter: 'blur(28px)',
                    opacity: 0.18,
                }}
            />

            <div className={classes.grid}>
                {/* ── LEFT: code ────────────────────────────────────── */}
                <div className={classes.codeCol}>
                    <label className={classes.label} htmlFor="snippet-content">
                        Code
                    </label>
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
                        <label className={classes.label} htmlFor="snippet-description">
                            Description
                        </label>
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
                        <label className={classes.label} htmlFor="snippet-language">
                            Language
                        </label>
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
        </form>
    );
};

export default SnippetForm;
