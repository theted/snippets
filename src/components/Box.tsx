/* eslint-disable react/require-default-props */
import React from 'react';

type Props = React.PropsWithChildren<{
  title?: string;
}>;

const classes = {
  container: 'w-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 backdrop-blur-2xl md:p-8 lg:p-10',
  title: 'font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-4xl',
};

const Box: React.FC<Props> = ({ title, children }) => (
  <div className={classes.container}>
    {title && (<h4 className={classes.title}>{title}</h4>)}
    {children}
  </div>
);

export default Box;
