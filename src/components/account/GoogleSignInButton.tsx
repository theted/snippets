import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/authContext';
import { loadGoogleIdentity } from '../../utils/googleIdentity';

/** Google's own sign-in button, rendered into a mount point by Identity Services. */
const GoogleSignInButton = () => {
  const { googleClientId, signInWithGoogleCredential, clearError } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    let isActive = true;

    const renderButton = async () => {
      try {
        const googleIdentity = await loadGoogleIdentity();
        if (!isActive || !mount) return;

        googleIdentity.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            if (!credential) return;
            clearError();
            void signInWithGoogleCredential(credential);
          },
        });
        googleIdentity.renderButton(mount, {
          theme: 'filled_black',
          size: 'medium',
          text: 'signin_with',
          shape: 'pill',
        });
      } catch {
        // The auth context exposes actionable API/auth errors.
      }
    };

    void renderButton();

    return () => {
      isActive = false;
      if (mount) mount.innerHTML = '';
    };
  }, [clearError, googleClientId, signInWithGoogleCredential]);

  return <div ref={mountRef} className="min-h-8" />;
};

export default GoogleSignInButton;
