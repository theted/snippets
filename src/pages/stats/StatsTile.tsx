import type { ReactNode } from 'react';
import { GlassPanel } from 'glass-design-system';
import Kicker from '../../components/Kicker';

type Props = {
  kicker: string;
  value: ReactNode;
  label?: string;
};

const StatsTile = ({ kicker, value, label }: Props) => (
  <GlassPanel
    intensity="subtle"
    topGlow={false}
    rounded="rounded-[1.8rem]"
    className="h-full p-6 md:p-8"
  >
    <div className="relative z-10 flex flex-col gap-2">
      <Kicker className="tracking-[0.28em]">{kicker}</Kicker>
      <div className="mt-3 font-[var(--font-display)] text-5xl font-[200] tracking-[-0.05em] text-[var(--color-text)] [text-shadow:0_1px_0_oklch(1_0_0_/_0.12),0_2px_16px_oklch(0_0_0_/_0.28)] md:text-6xl">
        {value}
      </div>
      {label ? <p className="mt-1 text-sm text-[var(--color-text-muted)]">{label}</p> : null}
    </div>
  </GlassPanel>
);

export default StatsTile;
