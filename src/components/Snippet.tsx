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

type Props = ISnippet & {
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
}

type SyntaxTheme = Record<string, React.CSSProperties>;

const allStyles = syntaxStyles as Record<string, SyntaxTheme>;

const classes = {
  container: 'group relative overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[oklch(0.22_0.028_254_/_0.42)] p-6 backdrop-blur-2xl transition duration-500 ease-out hover:-translate-y-1 hover:border-[var(--color-border-strong)] md:p-10 lg:p-12',
  // Subtle top-edge shimmer — simulates light catching the glass rim
  glassEdge: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
  glow: 'pointer-events-none absolute right-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,_oklch(0.72_0.16_240_/_0.28)_0%,_transparent_70%)] blur-2xl',
  heading: 'relative z-10 pb-10',
  meta: 'flex flex-col gap-6 md:flex-row md:items-start md:justify-between',
  titleBlock: 'max-w-4xl group/link',
  titleLink: 'block outline-none',
  kicker: 'text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel',
  title: 'mt-4 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-5xl lg:text-6xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_12px_oklch(0_0_0_/_0.32)]',
  description: 'mt-5 max-w-3xl text-sm leading-8 text-[var(--color-text-muted)] md:text-lg',
  code: 'relative z-10 text-base',
  language: 'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel',
  controls: 'mt-8 flex flex-wrap gap-3 opacity-100 transition duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100',
  controlButton: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
};

const customStyle = {
  margin: 0,
  padding: '3.5rem',
  borderRadius: '1.8rem',
  fontSize: '1.1rem',
  background: 'linear-gradient(160deg, oklch(0.19 0.022 254 / 0.88), oklch(0.15 0.018 255 / 0.92))',
  border: '1px solid oklch(0.39 0.043 248 / 0.28)',
  boxShadow: 'inset 0 1px 0 oklch(0.77 0.12 235 / 0.08), 0 24px 64px oklch(0.05 0.015 250 / 0.36)',
  transition: 'all 300ms ease',
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

  const handleDeleteConfirm = () => {
    setConfirmingDelete(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 18,
        filter: 'blur(4px)',
        duration: 0.42,
        ease: 'power3.in',
        onComplete: () => onDelete(id),
      });
    } else {
      onDelete(id);
    }
  };

  return (
    <div
      ref={cardRef}
      className={classes.container}
      style={{
        boxShadow: '0 8px 40px oklch(0.05 0.015 250 / 0.38), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={classes.glassEdge} />
      <div className={classes.glow} />
      {/* Mouse-tracking shimmer — more subtle than the search panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, oklch(0.86 0.08 228 / 0.07) 0%, transparent 50%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className={classes.heading}>
        <div className={classes.meta}>
          <div className={classes.titleBlock}>
            <Link to={`/snippets/${id}`} className={classes.titleLink}>
              <p className={classes.kicker}>
                Snippet
                {' '}
                {id}
              </p>
              <h3 className={`${classes.title} transition-colors duration-300 group-hover/link:text-[var(--color-accent-bright)]`}>
                {capitalize(title || 'Untitled snippet')}
              </h3>
              {description && (
                <p className={classes.description}>{description}</p>
              )}
            </Link>
          </div>
          <span className={classes.language}>{language || 'plaintext'}</span>
        </div>
      </div>
      <div className={classes.code}>
        {/* Scroll wrapper — caps height and enables inline scrolling */}
        <div
          ref={codeWrapRef}
          onScroll={handleCodeScroll}
          style={{
            maxHeight: 'min(800px, 90vh)',
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRadius: '1.8rem',
          }}
        >
          <SyntaxHighlighter
            language={language || 'javascript'}
            style={syntaxTheme}
            customStyle={{ ...customStyle, borderRadius: 0, marginBottom: 0 }}
            showLineNumbers={showLineNumbers}
            wrapLongLines
          >
            {content}
          </SyntaxHighlighter>
        </div>
        {/* Scroll-fade gradient — fades out when scrolled to the bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 transition-opacity duration-300"
          style={{
            bottom: 0,
            height: '6rem',
            borderRadius: '0 0 1.8rem 1.8rem',
            background: 'linear-gradient(to bottom, transparent, oklch(0.14 0.016 255 / 0.97))',
            opacity: showScrollFade ? 1 : 0,
          }}
        />
      </div>
      <div className={classes.controls}>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className={classes.controlButton}
        >
          <i className="icon-trash" />
          Delete
        </button>
        <button
          type="button"
          onClick={() => onEdit(id)}
          className={classes.controlButton}
        >
          <i className="icon-pencil" />
          Edit
        </button>
      </div>

      {confirmingDelete && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
};

export default Snippet;
