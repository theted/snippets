/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_GOOGLE_AUTH_ENABLED?: 'true' | 'false';
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleButtonConfiguration = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  logo_alignment?: 'left' | 'center';
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

type GoogleAccountsId = {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (element: HTMLElement, options: GoogleButtonConfiguration) => void;
  disableAutoSelect: () => void;
};

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
