import React from 'react';
import cx from 'classnames';

type Props = {
  type: 'button' | 'submit' | 'reset' | undefined;
  variant: 'success' | 'info' | 'warning' | 'error';
  onClick?: () => void;
};

const classes = {
  base: 'text-white rounded-full',
  alignment: 'inline-flex justify-center items-center',
  paddings: 'h-10 px-5',
  success: 'bg-green-600',
  info: 'bg-blue-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

const Button: React.FC<Props> = ({
  variant, type, onClick, children, ...rest
}) => (
  <button
    type="button"
    className={cx(
      classes.base,
      classes.alignment,
      classes.paddings,
      classes[variant],
      'mr-4',
    )}
    onClick={onClick}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {children}
  </button>
);

Button.defaultProps = {
  onClick: () => {},
};

export default Button;
