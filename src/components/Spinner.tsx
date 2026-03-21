import React, { useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';

export const SpinFigure = () => (
  <div className="spin-ring" />
);

const Spinner: React.FC = () => {
  const isFetching = useIsFetching();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFetching > 0) {
      // Delay before showing so fast cache-hit responses produce no flicker.
      const t = setTimeout(() => setVisible(true), 150);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [isFetching]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}
    >
      <SpinFigure />
    </div>
  );
};

export default Spinner;
