import { GlassPanel, GlassPill } from 'glass-design-system';
import type { SnippetId } from '../../types';
import Icon from '../../components/Icon';

type Props = {
  linkCopied: boolean;
  prevId: SnippetId | null;
  nextId: SnippetId | null;
  onBack: () => void;
  onCopyLink: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
};

const SnippetPageToolbar = ({
  linkCopied,
  prevId,
  nextId,
  onBack,
  onCopyLink,
  onNavigatePrev,
  onNavigateNext,
}: Props) => (
  <GlassPanel
    intensity="subtle"
    rounded="rounded-[1.6rem]"
    className="sticky top-4 z-10 flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
  >
    <div className="relative z-10 flex items-center gap-2">
      <GlassPill size="sm" className="whitespace-nowrap" onClick={onBack}>
        <Icon name="home" style={{ fontSize: '0.85em' }} />
        <span className="hidden sm:inline">Back to archive</span>
      </GlassPill>
      <GlassPill
        size="sm"
        className="whitespace-nowrap"
        onClick={onCopyLink}
        title="Copy permalink"
      >
        <Icon name="link" style={{ fontSize: '0.85em' }} />
        <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Link'}</span>
      </GlassPill>
    </div>

    <div className="relative z-10 flex items-center gap-2">
      <GlassPill
        size="sm"
        className="whitespace-nowrap"
        disabled={prevId === null}
        onClick={onNavigatePrev}
        title="Previous snippet (←)"
      >
        ← <span className="hidden sm:inline">Older</span>
      </GlassPill>
      <GlassPill
        size="sm"
        className="whitespace-nowrap"
        disabled={nextId === null}
        onClick={onNavigateNext}
        title="Next snippet (→)"
      >
        <span className="hidden sm:inline">Newer</span> →
      </GlassPill>
    </div>
  </GlassPanel>
);

export default SnippetPageToolbar;
