import React from 'react';
import { useIsFetching } from 'react-query';

export const SpinFigure = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
  </svg>
);

const Spinner: React.FC = () => {
  const isFetching = useIsFetching();

  if (!isFetching) return '';

  return (
    <div className="absolute top-10 right-10">
      <SpinFigure />
    </div>
  );
};

export default Spinner;
