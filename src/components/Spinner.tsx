import React from 'react';
import { useIsFetching } from '@tanstack/react-query';

export const SpinFigure = () => (
  <div className="spin-ring" />
);

const Spinner: React.FC = () => {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-40 hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-4 backdrop-blur-xl md:block">
      <SpinFigure />
    </div>
  );
};

export default Spinner;
