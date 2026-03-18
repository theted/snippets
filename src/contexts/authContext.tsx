import React, {
  createContext, PropsWithChildren, useContext, useEffect, useMemo, useState,
} from 'react';
import { GOOGLE_AUTH_ENABLED, GOOGLE_CLIENT_ID } from '../config';
import { AuthUser } from '../types';
import { getAuthSession, loginWithGoogleCredential, logoutAuth } from '../utils/auth';

const AUTH_STORAGE_KEY = 'snippets.auth.user';

type AuthContextValue = {
  authEnabled: boolean;
  googleClientId: string;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

function readStoredUser(): AuthUser | null {
  const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

const defaultContextValue: AuthContextValue = {
  authEnabled: false,
  googleClientId: '',
  user: null,
  isLoading: false,
  error: null,
  signInWithGoogleCredential: async () => {},
  signOut: async () => {},
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextValue>(defaultContextValue);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const featureEnabled = GOOGLE_AUTH_ENABLED && GOOGLE_CLIENT_ID.length > 0;
  const [authEnabled, setAuthEnabled] = useState<boolean>(featureEnabled);
  const [user, setUser] = useState<AuthUser | null>(() => (featureEnabled ? readStoredUser() : null));
  const [isLoading, setIsLoading] = useState<boolean>(featureEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!featureEnabled) {
      setAuthEnabled(false);
      setUser(null);
      setIsLoading(false);
      return undefined;
    }

    let isActive = true;

    const syncSession = async () => {
      try {
        const session = await getAuthSession();

        if (!isActive) {
          return;
        }

        setAuthEnabled(session.authEnabled);
        setUser(session.user);
        writeStoredUser(session.user);
        setError(null);
      } catch (sessionError) {
        if (!isActive) {
          return;
        }

        setAuthEnabled(false);
        setUser(null);
        writeStoredUser(null);
        setError(sessionError instanceof Error ? sessionError.message : 'Failed to initialize auth.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void syncSession();

    return () => {
      isActive = false;
    };
  }, [featureEnabled]);

  const signInWithGoogle = async (credential: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await loginWithGoogleCredential(credential);
      setAuthEnabled(session.authEnabled);
      setUser(session.user);
      writeStoredUser(session.user);
    } catch (signInError) {
      setUser(null);
      writeStoredUser(null);
      setError(signInError instanceof Error ? signInError.message : 'Google sign-in failed.');
      throw signInError;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logoutAuth();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Failed to sign out.');
    } finally {
      window.google?.accounts.id.disableAutoSelect();
      setUser(null);
      writeStoredUser(null);
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    authEnabled,
    googleClientId: GOOGLE_CLIENT_ID,
    user,
    isLoading,
    error,
    signInWithGoogleCredential: signInWithGoogle,
    signOut,
    clearError: () => setError(null),
  }), [authEnabled, user, isLoading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
