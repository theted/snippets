/* eslint-disable max-len */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import * as syntaxStyles from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { gsap } from 'gsap';

import { ThemeContext } from '../contexts/themeContext';
import { useGlass } from 'glass-design-system';
import { Snippet as ISnippet, SnippetId } from '../types';
import { capitalize } from '../utils/helpers';
import { getLanguageLabel } from '../utils/language';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import Icon from './Icon';
import Toast from './Toast';
import Chip from './Chip';
import {
    getSnippetBottomGlowStyle,
    getSnippetClasses,
    getSnippetCodeStyle,
    getSnippetContainerStyle,
    getSnippetFavoriteButtonClassName,
    getSnippetHoverOverlayStyle,
    getSnippetScrollFadeStyle,
    getSnippetTopGlowStyle,
} from './snippetStyles';

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
    const glassConfig = useGlass();
    const { showLineNumbers } = useContext(ThemeContext);
    const syntaxTheme = allStyles[theme as keyof typeof allStyles] ?? allStyles.vs2015;
    const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
    const [isHovered, setIsHovered] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [showScrollFade, setShowScrollFade] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    // Detail page (forceAutoSize) has one card — highlight immediately.
    // Archive cards start plain and highlight once they enter the viewport.
    const [highlighted, setHighlighted] = useState(forceAutoSize);
    const cardRef = useRef<HTMLDivElement>(null);
    const codeWrapRef = useRef<HTMLDivElement>(null);
    const languageLabel = getLanguageLabel(language);

    const c = getSnippetClasses(compact);
    const codeStyle = getSnippetCodeStyle(c, compact);

    useEffect(() => {
        if (highlighted) return;
        const el = cardRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setHighlighted(true); obs.disconnect(); } },
            { rootMargin: '800px' },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = codeWrapRef.current;
        if (el) setShowScrollFade(el.scrollHeight > el.clientHeight + 4);
    }, [content, highlighted]);

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
            data-testid="snippet-card"
            className={c.container}
            style={getSnippetContainerStyle({
                compact,
                config: glassConfig,
                mousePos,
                isHovered,
                forceAutoSize,
            })}
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
                style={getSnippetTopGlowStyle(compact)}
            />
            <div
                aria-hidden="true"
                className={c.bottomGlow}
                style={getSnippetBottomGlowStyle(compact)}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={getSnippetHoverOverlayStyle(mousePos, isHovered)}
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
                    <Chip
                        size={compact ? 'xs' : 'sm'}
                        onClick={onFilterLanguage
                            ? (e) => { e.preventDefault(); e.stopPropagation(); onFilterLanguage(language ?? 'plaintext'); }
                            : undefined}
                        title={onFilterLanguage
                            ? `Filter by ${languageLabel}`
                            : undefined}
                        className={compact ? 'shrink-0' : ''}
                    >
                        {languageLabel}
                    </Chip>
                </div>
            </div>
            <div className={c.code}>
                <div
                    data-testid="code-scroll-wrap"
                    ref={codeWrapRef}
                    onScroll={handleCodeScroll}
                    className="no-scrollbar"
                    style={{
                        height: forceAutoSize ? 'auto' : '100%',
                        maxHeight: forceAutoSize ? '1200px' : undefined,
                        overflowY: 'auto',
                        overflowX: 'auto',
                    }}
                >
                    {highlighted ? (
                        <SyntaxHighlighter
                            language={language || 'javascript'}
                            style={syntaxTheme}
                            customStyle={{ ...codeStyle, borderRadius: 0, marginBottom: 0, overflow: 'visible' }}
                            showLineNumbers={showLineNumbers}
                        >
                            {content}
                        </SyntaxHighlighter>
                    ) : (
                        <pre style={{ ...codeStyle, borderRadius: 0, marginBottom: 0, overflow: 'visible', whiteSpace: 'pre', fontFamily: 'inherit', color: syntaxTheme['hljs']?.color }}>
                            {content}
                        </pre>
                    )}
                </div>
            </div>
            <div
                data-testid="scroll-fade"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                style={getSnippetScrollFadeStyle(showScrollFade)}
            />
            <div className={c.controls}>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmingDelete(true); }}
                    className={c.controlButton}
                >
                    <Icon name="trash" />
                    Delete
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(id); }}
                    className={c.controlButton}
                >
                    <Icon name="pencil" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={handleCopy}
                    className={c.controlButton}
                >
                    <Icon name="code" />
                    Copy
                </button>
                {onToggleFavorite && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
                        className={getSnippetFavoriteButtonClassName(c.controlButton, isFavorite)}
                    >
                        <Icon name={isFavorite ? 'star' : 'star-empty'} />
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
