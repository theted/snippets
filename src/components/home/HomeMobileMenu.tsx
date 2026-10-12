import { useState } from 'react';
import { GlassPill } from 'glass-design-system';
import Preferences from '../../pages/Preferences';
import Icon from '../Icon';
import ArchiveLinkPills from './ArchiveLinkPills';

/** The top-bar navigation behind a menu button, for narrow viewports. */
const HomeMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="relative sm:hidden">
      <GlassPill
        size="md"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <Icon name={isOpen ? 'close' : 'menu'} />
      </GlassPill>

      <div
        className={[
          'absolute left-0 top-full mt-2 z-50 w-64',
          'transition-all duration-200 ease-out origin-top-left',
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none',
        ].join(' ')}
      >
        <div className="mobile-menu-panel">
          <ArchiveLinkPills size="md" className="w-full justify-start" onClick={close} />
          <Preferences size="md" className="w-full justify-start" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
      )}
    </div>
  );
};

export default HomeMobileMenu;
