import React from 'react';
import GlassPanel from './GlassPanel';

type Props = React.PropsWithChildren<{
  title?: string;
}>;

const Box: React.FC<Props> = ({ title, children }) => (
  <GlassPanel intensity="strong" rounded="rounded-[2rem]" className="p-6 md:p-8 lg:p-10">
    {title && (
      <h4 className="font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-4xl">
        {title}
      </h4>
    )}
    {children}
  </GlassPanel>
);

export default Box;
