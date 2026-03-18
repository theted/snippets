/* eslint-disable react/require-default-props */
import React from 'react';

type Props = React.PropsWithChildren<{
  title?: string;
}>;

const classes = {
  container: 'relative w-full overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-glass-card)] p-6 backdrop-blur-2xl md:p-8 lg:p-10',
  glassEdge: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
  title: 'font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-4xl',
};

const boxShadow = '0 8px 40px oklch(0.05 0.015 250 / 0.38), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)';

const Box: React.FC<Props> = ({ title, children }) => (
  <div className={classes.container} style={{ boxShadow }}>
    <div className={classes.glassEdge} />
    {title && (<h4 className={classes.title}>{title}</h4>)}
    {children}
  </div>
);

export default Box;
