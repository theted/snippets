/* eslint-disable max-len */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import * as syntaxStyles from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { gsap } from 'gsap';

import { ThemeContext } from '../contexts/themeContext';
import { CARD_BG_ALPHA, GLOW_TR, GLOW_BL } from '../design/glass';
import { Snippet as ISnippet, SnippetId } from '../types';
import { capitalize } from '../utils/helpers';
import { LANGUAGE_MAP } from '../config';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import Toast from './Toast';

type Props = ISnippet & {
    onDelete: (id: SnippetId) => void;
    onEdit: (id: SnippetId) => void;
    theme: string;
    /** Compact mode — smaller padding, smaller title, capped code height.
     *  Used by grid and masonry layouts. Stream layout uses full size. */
    compact?: boolean;
    /** Force auto-size regardless of the global preference (used on detail page). */
    forceAutoSize?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: (id: SnippetId) => void;
    onFilterLanguage?: (language: string) => void;
};

type SyntaxTheme = Record<string, React.CSSProperties>;

const allStyles = syntaxStyles as Record<string, SyntaxTheme>;

// ── Full (stream) class set ────────────────────────────────────────────────────

const fullClasses = {
    container:     'group relative overflow-hidden rounded-[2.2rem] p-6 backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 md:p-10 lg:p-12 cursor-pointer',
    glassEdge:     'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
    glow:          'pointer-events-none absolute right-[-8rem] top-[-6rem] h-96 w-96 rounded-full',
    heading:       'relative z-10 pb-10',
    meta:          'flex flex-col gap-6 md:flex-row md:items-start md:justify-between',
    titleBlock:    'max-w-4xl group/link',
    titleLink:     'block outline-none',
    kicker:        'text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel',
    title:         'mt-4 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-5xl lg:text-6xl text-bevel-strong',
    description:   'mt-5 max-w-3xl text-sm leading-8 text-[var(--color-text-muted)] md:text-lg text-bevel',
    code:          'relative z-10 overflow-hidden rounded-[1.8rem] text-base',
    language:      'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel',
    controls:      'relative z-30 mt-8 flex flex-wrap gap-3 opacity-100 transition duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100',
    controlButton: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
    codeMaxHeight: 'min(800px, 90vh)',
    codeFontSize:  '1.18rem',
    codeLineHeight: '1.75',
};

// ── Compact (grid / masonry) class set ────────────────────────────────────────

const compactClasses = {
    container:     'group relative overflow-hidden rounded-[1.6rem] p-4 md:p-5 backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 cursor-pointer',
    glassEdge:     'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
    glow:          'pointer-events-none absolute right-[-4rem] top-[-3rem] h-48 w-48 rounded-full',
    heading:       'relative z-10 pb-3',
    meta:          'flex items-start justify-between gap-3',
    titleBlock:    'min-w-0 group/link',
    titleLink:     'block outline-none',
    kicker:        'text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel',
    title:         'mt-1 font-[var(--font-display)] text-lg font-[300] tracking-[-0.04em] text-[var(--color-text)] md:text-xl text-bevel-strong',
    description:   'mt-1.5 text-xs leading-5 text-[var(--color-text-muted)] line-clamp-2 text-bevel',
    code:          'relative z-10 overflow-hidden rounded-[1.2rem] text-sm',
    language:      'inline-flex shrink-0 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[0.60rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-text-muted)] text-bevel',
    controls:      'relative z-30 mt-3 flex flex-wrap gap-2 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100',
    controlButton: 'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
    codeMaxHeight: '220px',
    codeFontSize:  '0.82rem',
    codeLineHeight: '1.6',
};

const baseCodeStyle = {
    margin: 0,
    padding: '0.5rem 0',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    letterSpacing: '0.012em',
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    textRendering: 'geometricPrecision' as const,
};

const Snippet: React.FC<Props> = ({
    id,
    title = '',
    content = '',
    description = '',
    language,
    onDelete,
    onEdit,
    theme,
    compact = false,
    forceAutoSize = false,
    isFavorite = false,
    onToggleFavorite,
    onFilterLanguage,
}) => {
    const navigate = useNavigate();
    const { showLineNumbers, autoSize: autoSizePreference } = useContext(ThemeContext);
    const autoSize = forceAutoSize || autoSizePreference;
    const syntaxTheme = allStyles[theme as keyof typeof allStyles] ?? allStyles.vs2015;
    const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
    const [isHovered, setIsHovered] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [showScrollFade, setShowScrollFade] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const codeWrapRef = useRef<HTMLDivElement>(null);

    const c = compact ? compactClasses : fullClasses;
    const codeStyle = {
        ...baseCodeStyle,
        borderRadius: compact ? '1.2rem' : '1.8rem',
        fontSize: c.codeFontSize,
        lineHeight: c.codeLineHeight,
    };

    useEffect(() => {
        const el = codeWrapRef.current;
        if (el) setShowScrollFade(el.scrollHeight > el.clientHeight + 4);
    }, [content]);

    const handleCodeScroll = () => {
        const el = codeWrapRef.current;
        if (el) setShowScrollFade(el.scrollHeight - el.scrollTop > el.clientHeight + 4);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(content).then(() => setShowCopiedToast(true));
    };

    const handleDeleteConfirm = () => {
        setConfirmingDelete(false);
        const ANIM_MS = 360;
        if (cardRef.current) {
            gsap.to(cardRef.current, {
                opacity: 0,
                scale: 0.94,
                y: 18,
                filter: 'blur(4px)',
                duration: ANIM_MS / 1000,
                ease: 'power3.in',
            });
        }
        setTimeout(() => onDelete(id), ANIM_MS);
    };

    return (
        <div
            ref={cardRef}
            className={c.container}
            style={{
                border: '1px solid transparent',
                backgroundImage: `
          linear-gradient(oklch(0.22 0.028 254 / ${CARD_BG_ALPHA}), oklch(0.22 0.028 254 / ${CARD_BG_ALPHA})),
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
            oklch(0.66 0.14 232 / ${isHovered ? '0.08' : '0.06'}),
            oklch(0.34 0.06 245 / ${isHovered ? '0.05' : '0.03'}) 52%,
            oklch(0.26 0.04 250 / 0.01) 100%)
        `,
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: isHovered
                    ? '0 12px 52px oklch(0.05 0.015 250 / 0.46), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)'
                    : '0 8px 40px oklch(0.05 0.015 250 / 0.38), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)',
                transition: 'box-shadow 500ms ease',
            }}
            onClick={() => navigate(`/snippets/${id}`)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Stretched background link — makes the whole card clickable */}
            <Link
                to={`/snippets/${id}`}
                className={`absolute inset-0 z-0 rounded-[inherit]`}
                tabIndex={-1}
                aria-hidden="true"
            />
            <div className={c.glassEdge} />
            <div
                className={c.glow}
                style={{
                    background: `radial-gradient(circle, oklch(${GLOW_TR} / 0.14) 0%, transparent 70%)`,
                    filter: `blur(${compact ? '48px' : '72px'})`,
                }}
            />
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute ${compact ? 'bottom-[-3rem] left-[-3rem] h-48 w-48' : 'bottom-[-5rem] left-[-5rem] h-80 w-80'} rounded-full`}
                style={{
                    background: `radial-gradient(circle, oklch(${GLOW_BL} / 0.12) 0%, transparent 70%)`,
                    filter: `blur(${compact ? '48px' : '64px'})`,
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(ellipse 120% 100% at ${mousePos.x}% ${mousePos.y}%, oklch(0.86 0.08 228 / 0.015) 0%, transparent 75%)`,
                    filter: 'blur(72px)',
                    opacity: isHovered ? 1 : 0,
                }}
            />
            <div className={c.heading}>
                <div className={c.meta}>
                    <div className={c.titleBlock}>
                        <Link to={`/snippets/${id}`} className={c.titleLink} onClick={(e) => e.stopPropagation()}>
                            <p className={c.kicker}>Snippet {id}</p>
                            <h3 className={`${c.title} transition-colors duration-300 group-hover/link:text-[var(--color-accent-bright)]`}>
                                {capitalize(title || 'Untitled snippet')}
                            </h3>
                            {description && <p className={c.description}>{description}</p>}
                        </Link>
                    </div>
                    {onFilterLanguage ? (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFilterLanguage(language ?? 'plaintext'); }}
                            className={`${c.language} cursor-pointer transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]`}
                            title={`Filter by ${LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] ?? language ?? 'plaintext'}`}
                        >
                            {LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] ?? language ?? 'plaintext'}
                        </button>
                    ) : (
                        <span className={c.language}>
                            {LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] ?? language ?? 'plaintext'}
                        </span>
                    )}
                </div>
            </div>
            <div className={c.code}>
                <div
                    data-testid="code-scroll-wrap"
                    ref={codeWrapRef}
                    onScroll={handleCodeScroll}
                    className="no-scrollbar"
                    style={{
                        maxHeight: autoSize ? '1200px' : c.codeMaxHeight,
                        overflowY: 'auto',
                        overflowX: 'auto',
                    }}
                >
                    <SyntaxHighlighter
                        language={language || 'javascript'}
                        style={syntaxTheme}
                        customStyle={{ ...codeStyle, borderRadius: 0, marginBottom: 0, overflow: 'visible' }}
                        showLineNumbers={showLineNumbers}
                    >
                        {content}
                    </SyntaxHighlighter>
                </div>
            </div>
            <div
                data-testid="scroll-fade"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                style={{
                    background: 'linear-gradient(to bottom, transparent 55%, oklch(0.11 0.016 255 / 0.38))',
                    opacity: showScrollFade ? 1 : 0,
                    borderRadius: 'inherit',
                }}
            />
            <div className={c.controls}>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmingDelete(true); }}
                    className={c.controlButton}
                >
                    <i className="icon-trash" />
                    Delete
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(id); }}
                    className={c.controlButton}
                >
                    <i className="icon-pencil" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={handleCopy}
                    className={c.controlButton}
                >
                    <i className="icon-code" />
                    Copy
                </button>
                {onToggleFavorite && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
                        className={`${c.controlButton} ${isFavorite ? '!border-[oklch(0.78_0.16_88_/_0.45)] !text-[oklch(0.82_0.18_88)]' : ''}`}
                    >
                        <i className={isFavorite ? 'icon-star' : 'icon-star-empty'} />
                        {isFavorite ? 'Saved' : 'Save'}
                    </button>
                )}
            </div>

            {confirmingDelete && (
                <DeleteConfirmDialog
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmingDelete(false)}
                />
            )}
            {showCopiedToast && (
                <Toast
                    message="Snippet copied to clipboard"
                    onDismiss={() => setShowCopiedToast(false)}
                />
            )}
        </div>
    );
};

export default Snippet;
