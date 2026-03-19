import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassPanel from '../components/GlassPanel';
import GlassPill from '../components/GlassPill';
import Kicker from '../components/Kicker';

// ── Shortcut row ─────────────────────────────────────────────────────────────

type ShortcutProps = {
  chord: string[][];  // each inner array is one key sequence; displayed with + between
  description: string;
  detail?: string;
};

const Chord: React.FC<{ keys: string[] }> = ({ keys }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((k, i) => (
      <React.Fragment key={k}>
        {i > 0 && (
          <span className="text-[0.65rem] font-semibold text-[var(--color-text-subtle)]">+</span>
        )}
        <kbd>{k}</kbd>
      </React.Fragment>
    ))}
  </span>
);

const ShortcutRow: React.FC<ShortcutProps> = ({ chord, description, detail }) => (
  <div className="group flex flex-col gap-4 border-b border-[var(--color-border)] py-5 last:border-0 sm:flex-row sm:items-start sm:gap-8">
    {/* Key badges — left column */}
    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:w-52">
      {chord.map((seq, i) => (
        <React.Fragment key={seq.join('+')}>
          {i > 0 && (
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
              or
            </span>
          )}
          <Chord keys={seq} />
        </React.Fragment>
      ))}
    </div>

    {/* Description — right column */}
    <div>
      <p className="text-sm font-medium text-[var(--color-text)]">{description}</p>
      {detail && (
        <p className="mt-1.5 text-xs leading-6 text-[var(--color-text-subtle)]">{detail}</p>
      )}
    </div>
  </div>
);

// ── Section heading ───────────────────────────────────────────────────────────

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <div className="mt-10 first:mt-0">
    <Kicker className="mb-1 text-[0.65rem] tracking-[0.36em]">{label}</Kicker>
    <div className="rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-glass-row)] px-6 backdrop-blur-xl">
      {children}
    </div>
  </div>
);

// ── Tip card ──────────────────────────────────────────────────────────────────

const Tip: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-glass-card)] p-5 backdrop-blur-xl">
    <Kicker className="text-[0.7rem] tracking-[0.28em]">{title}</Kicker>
    <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">{body}</p>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[72rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
};

const cardShadow = '0 8px 40px oklch(0.05 0.015 250 / 0.38), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)';

const Docs: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active instanceof HTMLInputElement
        || active instanceof HTMLTextAreaElement
        || active instanceof HTMLSelectElement;
      if (e.key === 'Escape' && !isInput) navigate('/');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <div className="App">
      <div className={classes.shell}>
        <GlassPill as={Link} to="/" size="md">
          <i className="icon-home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </GlassPill>

        <GlassPanel
          intensity="strong"
          topGlow
          rounded="rounded-[2.4rem]"
          className="snippet-detail-enter p-8 md:p-10 lg:p-12"
        >

          {/* Header */}
          <Kicker className="text-[0.7rem] tracking-[0.38em]">Reference</Kicker>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-5xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_16px_oklch(0_0_0_/_0.3)]">
            Keyboard Shortcuts
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
            The archive is built to stay out of your way. These shortcuts let you move through it
            without lifting your hands from the keyboard.
          </p>

          {/* Shortcuts ── Navigation */}
          <Section label="Navigation">
            <ShortcutRow
              chord={[['Escape']]}
              description="Return to the archive"
              detail="Works from any detail or reference page when no input is focused."
            />
            <ShortcutRow
              chord={[['Ctrl', '/']]}
              description="Open keyboard reference"
              detail="Opens this page from anywhere in the app."
            />
          </Section>

          {/* Shortcuts ── Archive */}
          <Section label="Archive">
            <ShortcutRow
              chord={[['Ctrl', 'I']]}
              description="Create new snippet"
              detail="Opens the creation panel with the code textarea pre-focused — paste and go."
            />
            <ShortcutRow
              chord={[['Ctrl', 'L']]}
              description="Focus the search field"
              detail="Jumps focus directly into the search input so you can start filtering immediately."
            />
            <ShortcutRow
              chord={[['Ctrl', ']']]}
              description="Next syntax theme"
              detail="Cycles forward through all available syntax highlighting themes. Your choice is saved automatically."
            />
            <ShortcutRow
              chord={[['Ctrl', '[']]}
              description="Previous syntax theme"
              detail="Cycles backward through all available syntax highlighting themes."
            />
          </Section>

          {/* Shortcuts ── Search */}
          <Section label="Search">
            <ShortcutRow
              chord={[['↓']]}
              description="Move focus into search results"
              detail="When the search input is focused and results are visible, ArrowDown moves focus to the first result."
            />
            <ShortcutRow
              chord={[['↑'], ['↓']]}
              description="Navigate between results"
              detail="ArrowUp and ArrowDown step through the results list. ArrowUp from the first item returns focus to the search input."
            />
            <ShortcutRow
              chord={[['Escape']]}
              description="Clear search & return to stream"
              detail="Clears the search term and restores the full snippet stream."
            />
          </Section>

          {/* Shortcuts ── Anywhere */}
          <Section label="Modals & panels">
            <ShortcutRow
              chord={[['Escape']]}
              description="Close any open modal"
              detail="Dismisses the edit, create, or preferences panel with a smooth exit animation."
            />
          </Section>

          {/* Tips & tricks */}
          <div className="mt-12">
            <Kicker className="mb-5 text-[0.65rem] tracking-[0.36em]">Tips &amp; tricks</Kicker>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Tip
                title="Search is debounced"
                body="Results update 600 ms after you stop typing — keeps the experience smooth on large archives without intermediate flicker."
              />
              <Tip
                title="100+ syntax themes"
                body="Open Preferences and swap the syntax highlighting theme live. Your choice is stored in localStorage and persists across sessions."
              />
              <Tip
                title="Line numbers are optional"
                body="Toggle them in Preferences. They're off by default to keep focus on the code itself, but useful when referencing specific lines."
              />
              <Tip
                title="Snippet detail page"
                body="Click any snippet title to open its own URL. Share it directly or bookmark it — each snippet has a stable, permanent address."
              />
              <Tip
                title="Edit controls appear on hover"
                body="On desktop, the Delete and Edit buttons slide in when you hover a snippet card. On touch devices they're always visible."
              />
              <Tip
                title="Optimistic UI"
                body="Deletes and edits update the list instantly while the server request runs in the background. If the request fails, the change is automatically rolled back."
              />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default Docs;
