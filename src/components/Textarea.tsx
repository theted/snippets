/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import cx from 'classnames';

type Props = React.ComponentPropsWithoutRef<'textarea'>;

const classes = 'block min-h-[13rem] w-full appearance-none rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-5 py-4 text-base leading-8 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition duration-300 ease-out focus:border-[var(--color-border-strong)] focus:outline-hidden focus:ring-4 focus:ring-[var(--color-accent-soft)] md:px-6 md:py-5 md:text-lg';

const Textarea: React.FC<Props> = ({ className, ...props }) => (
  <textarea {...props} className={cx(classes, className)} />
);

export default Textarea;
