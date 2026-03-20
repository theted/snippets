import React, { useContext, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { less, sCSS } from '@codemirror/legacy-modes/mode/css';
import { sass } from '@codemirror/legacy-modes/mode/sass';
import { stylus } from '@codemirror/legacy-modes/mode/stylus';

import { ThemeContext } from '../contexts/themeContext';

// ── Language mapping ─────────────────────────────────────────────────────────

function getLanguageExtension(language: string) {
    switch (language) {
        case 'javascript':
            return [javascript({ jsx: true })];
        case 'typescript':
            return [javascript({ typescript: true, jsx: true })];
        case 'python':
            return [python()];
        case 'css':
            return [css()];
        case 'less':
            return [StreamLanguage.define(less)];
        // app uses 'sass' key for both SASS indent syntax and SCSS
        case 'sass':
            return [StreamLanguage.define(sCSS)];
        case 'stylus':
            return [StreamLanguage.define(stylus)];
        case 'sql':
            return [sql()];
        case 'yaml':
            return [yaml()];
        case 'markdown':
            return [markdown()];
        case 'php':
            return [php()];
        case 'go':
            return [StreamLanguage.define(go)];
        case 'csharp':
            return [StreamLanguage.define(csharp)];
        case 'dockerfile':
            return [StreamLanguage.define(dockerFile)];
        // 'haml', 'plaintext' — no extension, plain text
        default:
            return [];
    }
}

// ── App-shell theme overlay ──────────────────────────────────────────────────
// Applied after oneDark so only structural colours are overridden; all syntax
// token colours stay from oneDark.

const appOverlay = EditorView.theme({
    // Transparent background — the wrapper <div> provides the gradient + glass
    '&': {
        background: 'transparent !important',
    },
    '&.cm-focused': {
        outline: 'none !important',
    },
    // Gutter (line-numbers column)
    '.cm-gutters': {
        background: 'oklch(0.14 0.016 258 / 0.42) !important',
        borderRight: '1px solid oklch(0.39 0.043 248 / 0.28) !important',
        color: 'oklch(0.48 0.03 255) !important',
    },
    '.cm-activeLineGutter': {
        background: 'oklch(0.22 0.028 254 / 0.6) !important',
        color: 'oklch(0.65 0.04 252) !important',
    },
    // Active line highlight
    '.cm-activeLine': {
        background: 'oklch(0.22 0.028 254 / 0.35) !important',
    },
    // Selection
    '.cm-selectionBackground': {
        background: 'oklch(0.72 0.14 236 / 0.28) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
        background: 'oklch(0.72 0.14 236 / 0.32) !important',
    },
    // Cursor
    '.cm-cursor': {
        borderLeftColor: 'oklch(0.71 0.17 244) !important',
        borderLeftWidth: '2px !important',
    },
    // Matching brackets
    '.cm-matchingBracket': {
        background: 'oklch(0.71 0.17 244 / 0.18) !important',
        outline: '1px solid oklch(0.71 0.17 244 / 0.38) !important',
        borderRadius: '2px',
    },
    // Text / scroller
    '.cm-scroller': {
        fontFamily: 'var(--font-code) !important',
        lineHeight: '1.85 !important',
        scrollbarWidth: 'none',
    },
    '.cm-scroller::-webkit-scrollbar': {
        display: 'none',
    },
    '.cm-content': {
        padding: '1.75rem 0',
    },
    '.cm-lineNumbers .cm-gutterElement': {
        paddingLeft: '1.2rem',
        paddingRight: '1.4rem',
        minWidth: '3.2rem',
    },
    '.cm-line': {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
    },
    // Search match highlight
    '.cm-searchMatch': {
        background: 'oklch(0.8 0.13 88 / 0.22) !important',
        outline: '1px solid oklch(0.8 0.13 88 / 0.4) !important',
        borderRadius: '2px',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
        background: 'oklch(0.8 0.13 88 / 0.38) !important',
    },
    // Tooltip (autocompletion popup)
    '.cm-tooltip': {
        background: 'var(--color-glass-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.9rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 40px oklch(0.04 0.01 258 / 0.6)',
        overflow: 'hidden',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected="true"]': {
        background: 'oklch(0.71 0.17 244 / 0.22) !important',
        color: 'var(--color-text) !important',
    },
});

// ── Component ────────────────────────────────────────────────────────────────

type Props = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    language: string;
    placeholder?: string;
    autoFocus?: boolean;
    minHeight?: string;
    maxHeight?: string;
    height?: string;
    className?: string;
    onSubmit?: () => void;
};

const CodeEditor: React.FC<Props> = ({
    id,
    value,
    onChange,
    language,
    placeholder = 'Paste or type your code here…',
    autoFocus = false,
    minHeight = '30rem',
    maxHeight = '800px',
    height,
    className = '',
    onSubmit,
}) => {
    const { showLineNumbers } = useContext(ThemeContext);
    const langExts = useMemo(() => getLanguageExtension(language), [language]);

    // Prec.highest ensures these run before CodeMirror's built-in keybindings.
    // Ctrl-Enter submits the enclosing form; Escape blurs the editor so the
    // user can Tab to other fields without being trapped.
    const shortcutKeymap = useMemo(() => Prec.highest(keymap.of([
        { key: 'Ctrl-Enter', run: () => { onSubmit?.(); return true; } },
        {
            key: 'Escape',
            run: (view) => {
                view.contentDOM.blur();
                // Move focus to the next focusable element in the enclosing form
                const form = view.dom.closest('form');
                if (form) {
                    const focusable = Array.from(
                        form.querySelectorAll<HTMLElement>(
                            'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
                        )
                    );
                    const editorIdx = focusable.findIndex((el) => view.dom.contains(el));
                    const next = focusable[editorIdx + 1];
                    next?.focus();
                }
                return true;
            },
        },
    ])), [onSubmit]);

    return (
        <div
            className={`overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] transition-[border-color,box-shadow] duration-300 focus-within:border-[oklch(0.62_0.16_240_/_0.65)] focus-within:[box-shadow:0_0_0_3px_oklch(0.71_0.17_244_/_0.14),inset_0_1px_0_oklch(0.77_0.12_235_/_0.08)]${className ? ` ${className}` : ''}`}
            style={{
                background:
                    'linear-gradient(160deg, oklch(0.18 0.022 254 / 0.38), oklch(0.14 0.018 255 / 0.48))',
                backdropFilter: 'blur(24px)',
                boxShadow:
                    'inset 0 1px 0 oklch(0.77 0.12 235 / 0.1), 0 16px 48px oklch(0.05 0.015 250 / 0.2)',
                fontSize: '1.05rem',
            }}
        >
            <CodeMirror
                id={id}
                value={value}
                onChange={onChange}
                theme={oneDark}
                extensions={[...langExts, appOverlay, EditorView.lineWrapping, shortcutKeymap]}
                autoFocus={autoFocus}
                height={height}
                minHeight={minHeight}
                maxHeight={maxHeight}
                placeholder={placeholder}
                basicSetup={{
                    lineNumbers: showLineNumbers,
                    foldGutter: showLineNumbers,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    autocompletion: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    tabSize: 2,
                    defaultKeymap: true,
                    searchKeymap: true,
                    historyKeymap: true,
                    drawSelection: true,
                    dropCursor: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
