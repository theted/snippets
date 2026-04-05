import type { CSSProperties } from 'react';

type Props = {
  message?: string;
};

const errorTextStyle: CSSProperties = {
  color: 'var(--color-danger)',
  fontSize: '0.72rem',
  marginTop: '-0.25rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
};

const SnippetFormFieldError = ({ message }: Props) =>
  message ? (
    <p role="alert" style={errorTextStyle}>
      {message}
    </p>
  ) : null;

export default SnippetFormFieldError;
