const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let googleIdentityScriptPromise: Promise<GoogleAccountsId> | null = null;

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (window.google?.accounts.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`);

    const resolveGoogleIdentity = () => {
      if (window.google?.accounts.id) {
        resolve(window.google.accounts.id);
      } else {
        reject(new Error('Google Identity Services failed to initialize.'));
      }
    };

    if (existingScript) {
      existingScript.addEventListener('load', resolveGoogleIdentity, { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', resolveGoogleIdentity, { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}
