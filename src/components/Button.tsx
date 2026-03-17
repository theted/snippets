import React from 'react';
import cx from 'classnames';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant: 'success' | 'info' | 'warning' | 'error';
};

const classes = {
  base: 'inline-flex items-center justify-center gap-3 rounded-full border px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] transition duration-300 ease-out focus:outline-hidden focus:ring-4 focus:ring-[var(--color-accent-soft)]',
  success: 'border-transparent bg-[var(--color-accent)] text-[var(--color-ink)] hover:-translate-y-0.5 hover:bg-[var(--color-accent-bright)]',
  info: 'border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)]',
  warning: 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]',
  error: 'border-transparent bg-[var(--color-danger)] text-[var(--color-text)] hover:-translate-y-0.5 hover:bg-[oklch(0.7_0.19_25)]',
};

const Button: React.FC<Props> = ({
  variant, type = 'button', onClick, className, children, ...rest
}) => (
  <button
    type={type}
    className={cx(
      classes.base,
      classes[variant],
      className,
    )}
    onClick={onClick}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {children}
  </button>
);

export default Button;
