import type { ReactNode } from 'react';
import { getMaxFourColumnGridClassName } from './statsUtils';

type Props = {
  itemCount: number;
  children: ReactNode;
  className?: string;
};

const StatsTileGrid = ({ itemCount, children, className = '' }: Props) => (
  <div
    className={[
      'grid gap-4',
      getMaxFourColumnGridClassName(itemCount),
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);

export default StatsTileGrid;
