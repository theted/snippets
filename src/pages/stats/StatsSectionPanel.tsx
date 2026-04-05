import type { ReactNode } from 'react';
import { GlassPanel } from 'glass-design-system';
import Kicker from '../../components/Kicker';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const StatsSectionPanel = ({
  title,
  description,
  children,
  className = '',
}: Props) => (
  <GlassPanel
    intensity="strong"
    topGlow
    bottomGlow
    rounded="rounded-[2.4rem]"
    className={['p-8 md:p-10', className].filter(Boolean).join(' ')}
  >
    <div className="relative z-10">
      <Kicker>{title}</Kicker>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-subtle)]">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  </GlassPanel>
);

export default StatsSectionPanel;
