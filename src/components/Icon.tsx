/* eslint-disable max-len */
import React from 'react';

export type IconName =
  | 'home'
  | 'star'
  | 'star-empty'
  | 'info'
  | 'cog'
  | 'cancel'
  | 'trash'
  | 'pencil'
  | 'code'
  | 'plus'
  | 'menu'
  | 'close'
  | 'chart'
  | 'link'
  | 'layout-auto'
  | 'layout-spotlight'
  | 'layout-grid'
  | 'layout-masonry'
  | 'layout-stream'
  | 'layout-cascade';

interface IconProps {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}

const ICON_SVGS: Partial<Record<IconName, React.ReactElement>> = {
  chart: (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true">
      <rect x="0" y="6" width="2.5" height="5" rx="0.7" />
      <rect x="4.25" y="3" width="2.5" height="8" rx="0.7" />
      <rect x="8.5" y="0" width="2.5" height="11" rx="0.7" />
    </svg>
  ),
  menu: (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" aria-hidden="true">
      <rect x="0" y="0" width="14" height="1.8" rx="0.9" />
      <rect x="0" y="4.1" width="14" height="1.8" rx="0.9" />
      <rect x="0" y="8.2" width="14" height="1.8" rx="0.9" />
    </svg>
  ),
  close: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="1" y1="1" x2="9" y2="9" />
      <line x1="9" y1="1" x2="1" y2="9" />
    </svg>
  ),
};

const LAYOUT_SVGS: Partial<Record<IconName, React.ReactElement>> = {
  'layout-auto': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="3.5" height="11" rx="1" />
      <rect x="4.5" y="2" width="6.5" height="7" rx="1" />
      <rect x="4.5" y="0" width="1" height="2.5" rx="0.5" />
      <rect x="4.5" y="8.5" width="1" height="2.5" rx="0.5" />
    </svg>
  ),
  'layout-spotlight': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="11" height="5.5" rx="1" />
      <rect x="0" y="7" width="3" height="4" rx="1" />
      <rect x="4" y="7" width="3" height="4" rx="1" />
      <rect x="8" y="7" width="3" height="4" rx="1" />
    </svg>
  ),
  'layout-grid': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="4.5" height="4.5" rx="1" />
      <rect x="6.5" y="0" width="4.5" height="4.5" rx="1" />
      <rect x="0" y="6.5" width="4.5" height="4.5" rx="1" />
      <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1" />
    </svg>
  ),
  'layout-masonry': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="4.5" height="7" rx="1" />
      <rect x="6.5" y="0" width="4.5" height="4.5" rx="1" />
      <rect x="0" y="8.5" width="4.5" height="2.5" rx="1" />
      <rect x="6.5" y="6" width="4.5" height="5" rx="1" />
    </svg>
  ),
  'layout-stream': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="11" height="2.8" rx="1" />
      <rect x="0" y="4.1" width="11" height="2.8" rx="1" />
      <rect x="0" y="8.2" width="11" height="2.8" rx="1" />
    </svg>
  ),
  'layout-cascade': (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <rect x="0" y="0" width="11" height="2.4" rx="1" />
      <rect x="0" y="4.1" width="5.1" height="2.4" rx="1" />
      <rect x="5.9" y="4.1" width="5.1" height="2.4" rx="1" />
      <rect x="0" y="8.2" width="2.8" height="2.4" rx="1" />
      <rect x="4.1" y="8.2" width="2.8" height="2.4" rx="1" />
      <rect x="8.2" y="8.2" width="2.8" height="2.4" rx="1" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className, style }) => {
  const svg = ICON_SVGS[name] ?? LAYOUT_SVGS[name];
  if (svg) return <span className={className} style={style}>{svg}</span>;
  return <i className={[`icon-${name}`, className].filter(Boolean).join(' ')} style={style} />;
};

export default Icon;
