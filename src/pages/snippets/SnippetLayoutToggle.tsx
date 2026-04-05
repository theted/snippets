import { GlassPanel, GlassPill } from 'glass-design-system';
import Icon, { type IconName } from '../../components/Icon';
import type { SnippetLayout } from '../../config';
import { LAYOUT_OPTIONS } from './snippetLayoutUtils';

type Props = {
  layout: SnippetLayout;
  onChange: (layout: SnippetLayout) => void;
};

const layoutIcons: Record<SnippetLayout, IconName> = {
  auto: 'layout-auto',
  spotlight: 'layout-spotlight',
  cascade: 'layout-cascade',
  grid: 'layout-grid',
  masonry: 'layout-masonry',
  stream: 'layout-stream',
};

const SnippetLayoutToggle = ({ layout, onChange }: Props) => (
  <div className="mt-6 flex justify-end">
    <GlassPanel
      intensity="subtle"
      rounded="rounded-[1.4rem]"
      className="inline-flex items-center gap-1.5 px-3 py-2.5"
    >
      {LAYOUT_OPTIONS.map((option) => (
        <GlassPill
          key={option}
          size="xs"
          className="whitespace-nowrap"
          variant={layout === option ? 'active' : 'default'}
          onClick={() => onChange(option)}
          title={option}
        >
          <Icon name={layoutIcons[option]} />
          <span className="hidden sm:inline">{option}</span>
        </GlassPill>
      ))}
    </GlassPanel>
  </div>
);

export default SnippetLayoutToggle;
