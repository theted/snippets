import { Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import Icon from '../Icon';

const archiveLinks = [
  { to: '/favorites', icon: 'star-empty', label: 'Favorites' },
  { to: '/docs', icon: 'info', label: 'Shortcuts' },
  { to: '/stats', icon: 'chart', label: 'Status' },
] as const;

type Props = {
  size: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
};

const ArchiveLinkPills = ({ size, className = '', onClick }: Props) => (
  <>
    {archiveLinks.map(({ to, icon, label }) => (
      <GlassPill
        key={to}
        as={Link}
        to={to}
        size={size}
        className={className}
        onClick={onClick}
      >
        <Icon name={icon} />
        <span>{label}</span>
      </GlassPill>
    ))}
  </>
);

export default ArchiveLinkPills;
