import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/authContext';
import { GOOGLE_AUTH_ENABLED } from '../config';
import { loadGoogleIdentity } from '../utils/googleIdentity';

const classes = {
  shell: 'min-w-[18rem] rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-left backdrop-blur-2xl',
  kicker: 'text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]',
  title: 'mt-2 text-sm leading-6 text-[var(--color-text)]',
  meta: 'mt-2 text-xs leading-5 text-[var(--color-text-muted)]',
  userRow: 'mt-4 flex items-center gap-3',
  avatar: 'h-10 w-10 rounded-full border border-[var(--color-border)] object-cover',
  fallbackAvatar: 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm font-semibold uppercase text-[var(--color-text)]',
  userName: 'text-sm font-semibold text-[var(--color-text)]',
  userEmail: 'text-xs text-[var(--color-text-muted)]',
  actions: 'mt-4 flex items-center justify-between gap-3',
  buttonMount: 'mt-4 min-h-[44px]',
  error: 'mt-3 text-xs leading-5 text-[var(--color-danger)]',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

const GoogleAuth: React.FC = () => {
  const {
    authEnabled,
    googleClientId,
    user,
    isLoading,
    error,
    signInWithGoogleCredential,
    signOut,
    clearError,
  } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_AUTH_ENABLED || !authEnabled || !googleClientId || user || !buttonRef.current) {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
      return undefined;
    }

    let isActive = true;

    const renderGoogleButton = async () => {
      try {
        const googleIdentity = await loadGoogleIdentity();

        if (!isActive || !buttonRef.current) {
          return;
        }

        buttonRef.current.innerHTML = '';
        googleIdentity.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!response.credential) {
              return;
            }

            clearError();
            void signInWithGoogleCredential(response.credential);
          },
        });
        googleIdentity.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 260,
        });
      } catch {
        // The auth context exposes actionable API/auth errors.
      }
    };

    void renderGoogleButton();

    return () => {
      isActive = false;
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, [authEnabled, clearError, googleClientId, signInWithGoogleCredential, user]);

  if (!GOOGLE_AUTH_ENABLED || googleClientId.length === 0) {
    return null;
  }

  return (
    <div className={classes.shell}>
      <p className={classes.kicker}>Identity Preview</p>
      <p className={classes.title}>
        Google sign-in is optional for now.
        Anonymous snippet creation remains enabled.
      </p>

      {user ? (
        <>
          <div className={classes.userRow}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className={classes.avatar} />
            ) : (
              <div className={classes.fallbackAvatar}>{getInitials(user.displayName)}</div>
            )}
            <div>
              <p className={classes.userName}>{user.displayName}</p>
              <p className={classes.userEmail}>{user.email}</p>
            </div>
          </div>
          <div className={classes.actions}>
            <p className={classes.meta}>Signed in through Google.</p>
            <Button
              type="button"
              variant="warning"
              onClick={() => { void signOut(); }}
              className="px-4 py-2.5"
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <>
          <div ref={buttonRef} className={classes.buttonMount} />
          <p className={classes.meta}>
            The backend verifies Google ID tokens and stores user records, but snippet posting is
            still open to everyone for now.
          </p>
        </>
      )}

      {isLoading && (
        <p className={classes.meta}>Syncing account state...</p>
      )}

      {!authEnabled && !isLoading && (
        <p className={classes.error}>
          Google auth is enabled in the frontend but not available from the current API.
        </p>
      )}

      {error && (
        <p className={classes.error}>{error}</p>
      )}
    </div>
  );
};

export default GoogleAuth;
