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
  | 'plus';

interface IconProps {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, className, style }) => (
  <i className={[`icon-${name}`, className].filter(Boolean).join(' ')} style={style} />
);

export default Icon;
