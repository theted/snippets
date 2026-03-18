/* eslint-disable max-len */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import * as syntaxStyles from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { gsap } from 'gsap';

import { ThemeContext } from '../contexts/themeContext';
import { Snippet as ISnippet, SnippetId } from '../types';
import { capitalize } from '../utils/helpers';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import Toast from './Toast';

type Props = ISnippet & {
    onDelete: (id: SnippetId) => void;
    onEdit: (id: SnippetId) => void;
    theme: string;
};

type SyntaxTheme = Record<string, React.CSSProperties>;

const allStyles = syntaxStyles as Record<string, SyntaxTheme>;

const classes = {
    container:
        'group relative overflow-hidden rounded-[2.2rem] p-6 backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 md:p-10 lg:p-12 cursor-pointer',
    // Subtle top-edge shimmer — simulates light catching the glass rim
    glassEdge:
        'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
    glow: 'pointer-events-none absolute right-[-8rem] top-[-6rem] h-96 w-96 rounded-full',
    heading: 'relative z-10 pb-10',
    meta: 'flex flex-col gap-6 md:flex-row md:items-start md:justify-between',
    titleBlock: 'max-w-4xl group/link',
    titleLink: 'block outline-none',
    kicker: 'text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel',
    title: 'mt-4 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-5xl lg:text-6xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_12px_oklch(0_0_0_/_0.32)]',
    description: 'mt-5 max-w-3xl text-sm leading-8 text-[var(--color-text-muted)] md:text-lg',
    code: 'relative z-10 overflow-hidden rounded-[1.8rem] text-base',
    language:
        'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel',
    controls:
        'relative z-30 mt-8 flex flex-wrap gap-3 opacity-100 transition duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100',
    controlButton:
        'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
};

const customStyle = {
    margin: 0,
    padding: '0.5rem 0',
    borderRadius: '1.8rem',
    fontSize: '1.18rem',
    lineHeight: '1.75',
    letterSpacing: '0.012em',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
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
}) => {
    const { showLineNumbers } = useContext(ThemeContext);
    const syntaxTheme = allStyles[theme as keyof typeof allStyles] ?? allStyles.vs2015;
    const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
    const [isHovered, setIsHovered] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [showScrollFade, setShowScrollFade] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const codeWrapRef = useRef<HTMLDivElement>(null);

    // Show fade indicator whenever the code block has hidden content below
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
        // Animate the card out (cosmetic). Delete fires via setTimeout so it is
        // never blocked by GSAP completion — the card's own CSS `transition`
        // declaration can interfere with onComplete on some browsers.
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
            className={classes.container}
            style={{
                border: '1px solid transparent',
                backgroundImage: `
          linear-gradient(oklch(0.22 0.028 254 / 0.42), oklch(0.22 0.028 254 / 0.42)),
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
            oklch(0.66 0.14 232 / ${isHovered ? '0.16' : '0.10'}),
            oklch(0.34 0.06 245 / ${isHovered ? '0.10' : '0.07'}) 52%,
            oklch(0.26 0.04 250 / 0.04) 100%)
        `,
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: isHovered
                    ? '0 12px 52px oklch(0.05 0.015 250 / 0.46), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)'
                    : '0 8px 40px oklch(0.05 0.015 250 / 0.38), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)',
                transition: 'box-shadow 500ms ease',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Stretched background link — makes the whole card clickable */}
            <Link
                to={`/snippets/${id}`}
                className="absolute inset-0 z-0 rounded-[2.2rem]"
                tabIndex={-1}
                aria-hidden="true"
            />
            <div className={classes.glassEdge} />
            {/* Top-right glow */}
            <div
                className={classes.glow}
                style={{
                    background: 'radial-gradient(circle, oklch(0.72 0.16 240 / 0.14) 0%, transparent 70%)',
                    filter: 'blur(72px)',
                }}
            />
            {/* Bottom-left glow — cooler teal, balances the top-right */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-5rem] left-[-5rem] h-80 w-80 rounded-full"
                style={{
                    background: 'radial-gradient(circle, oklch(0.58 0.14 210 / 0.12) 0%, transparent 70%)',
                    filter: 'blur(64px)',
                }}
            />
            {/* Mouse-tracking shimmer — more subtle than the search panel */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(ellipse 120% 100% at ${mousePos.x}% ${mousePos.y}%, oklch(0.86 0.08 228 / 0.03) 0%, transparent 75%)`,
                    filter: 'blur(72px)',
                    opacity: isHovered ? 1 : 0,
                }}
            />
            <div className={classes.heading}>
                <div className={classes.meta}>
                    <div className={classes.titleBlock}>
                        <Link to={`/snippets/${id}`} className={classes.titleLink}>
                            <p className={classes.kicker}>Snippet {id}</p>
                            <h3
                                className={`${classes.title} transition-colors duration-300 group-hover/link:text-[var(--color-accent-bright)]`}
                            >
                                {capitalize(title || 'Untitled snippet')}
                            </h3>
                            {description && <p className={classes.description}>{description}</p>}
                        </Link>
                    </div>
                    <span className={classes.language}>{language || 'plaintext'}</span>
                </div>
            </div>
            <div className={classes.code}>
                {/* Scroll wrapper — caps height and enables inline scrolling.
            overflowX:auto lets wide code scroll right instead of wrapping. */}
                <div
                    data-testid="code-scroll-wrap"
                    ref={codeWrapRef}
                    // onScroll={handleCodeScroll}
                    // className="no-scrollbar"
                    // style={{
                    //     maxHeight: 'min(800px, 90vh)',
                    //     overflowY: 'auto',
                    //     overflowX: 'auto',
                    // }}
                >
                    <SyntaxHighlighter
                        language={language || 'javascript'}
                        style={syntaxTheme}
                        customStyle={{ ...customStyle, borderRadius: 0, marginBottom: 0 }}
                        showLineNumbers={showLineNumbers}
                    >
                        {content}
                    </SyntaxHighlighter>
                </div>
            </div>
            {/* Full-panel scroll fade — absolute over the whole card so the gradient
          spans edge-to-edge. Fades from transparent (top half) to dark (bottom). */}
            <div
                data-testid="scroll-fade"
                aria-hidden="true"
                // className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                // style={{
                //   background: 'linear-gradient(to bottom, transparent 45%, oklch(0.11 0.016 255 / 0.97))',
                //   opacity: showScrollFade ? 1 : 0,
                //   borderRadius: 'inherit',
                // }}
            />
            <div className={classes.controls}>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmingDelete(true); }}
                    className={classes.controlButton}
                >
                    <i className="icon-trash" />
                    Delete
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(id); }}
                    className={classes.controlButton}
                >
                    <i className="icon-pencil" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={handleCopy}
                    className={classes.controlButton}
                >
                    <i className="icon-code" />
                    Copy
                </button>
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
