import React, { FC } from 'react';
import cx from 'classnames';

type SelectOption = {
  label: string;
  value: string | number;
}

type Props = React.ComponentPropsWithoutRef<'select'> & {
  options: SelectOption[];
};

const classes = {
  container: 'block w-full cursor-pointer appearance-none rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-5 py-4 text-base leading-normal text-[var(--color-text)] transition duration-300 ease-out focus:border-[var(--color-border-strong)] focus:outline-hidden focus:ring-4 focus:ring-[var(--color-accent-soft)] md:px-6 md:py-5 md:text-lg',
};

const Dropdown: FC<Props> = ({
  name, options, onChange, className, ...rest
}) => (
  <select
    name={name}
    className={cx(classes.container, className)}
    onChange={onChange}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {options.map(({ label, value }) => (<option key={`${label}-${value}`} value={value}>{label}</option>))}
  </select>
);

export default Dropdown;
