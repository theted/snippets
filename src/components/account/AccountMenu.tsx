import { useCallback, useRef, useState } from 'react';
import { GlassPanel, GlassPill } from 'glass-design-system';
import { useAuth } from '../../contexts/authContext';
import { GOOGLE_AUTH_ENABLED } from '../../config';
import type { AuthUser } from '../../types';
import AccountAvatar from './AccountAvatar';
import GoogleSignInButton from './GoogleSignInButton';
import useDismiss from './useDismiss';

const errorClass = 'max-w-[16rem] text-right text-xs leading-5 text-[var(--color-danger)]';

type SignedInMenuProps = {
  user: AuthUser;
  onSignOut: () => Promise<void>;
};

const SignedInMenu = ({ user, onSignOut }: SignedInMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(menuRef, isOpen, close);

  const [firstName] = user.displayName.split(' ');

  return (
    <div ref={menuRef} className="relative">
      <GlassPill
        size="sm"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-label={`Account: ${user.displayName}`}
      >
        <AccountAvatar user={user} size="sm" />
        <span>{firstName}</span>
      </GlassPill>

      {isOpen && (
        <GlassPanel
          intensity="strong"
          rounded="rounded-[1.4rem]"
          className="absolute right-0 top-full z-50 mt-2 w-72 p-5"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <AccountAvatar user={user} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user.displayName}</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
              </div>
            </div>
            <GlassPill size="sm" className="mt-5" onClick={() => { close(); void onSignOut(); }}>
              Sign out
            </GlassPill>
          </div>
        </GlassPanel>
      )}
    </div>
  );
};

/** The top-right account control: Google's sign-in button, or the signed-in user's menu. */
const AccountMenu = () => {
  const {
    authEnabled, googleClientId, user, isLoading, error, signOut,
  } = useAuth();

  if (!GOOGLE_AUTH_ENABLED || googleClientId.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      {user
        ? <SignedInMenu user={user} onSignOut={signOut} />
        : authEnabled && <GoogleSignInButton />}

      {!authEnabled && !isLoading && (
        <p className={errorClass}>Sign-in is unavailable: the API has Google sign-in turned off.</p>
      )}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
};

export default AccountMenu;
