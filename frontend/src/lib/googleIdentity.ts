// Loads Google Identity Services and requests a Google ID token in the browser.
// The token is verified server-side in backend/src/services/googleAuth.service.js —
// this file only gets the token, it never trusts it.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type GoogleCredentialResponse = { credential?: string };
type GoogleNotification = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: (momentListener?: (notification: GoogleNotification) => void) => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not reach Google Sign-In — check your connection and try again'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Resolves with a Google ID token (JWT) once the user completes the Google
// One Tap / account chooser flow, or rejects if it's cancelled/blocked.
export async function requestGoogleIdToken(): Promise<string> {
  if (!CLIENT_ID) {
    throw new Error('Google Sign-In is not configured (missing VITE_GOOGLE_CLIENT_ID)');
  }

  await loadScript();

  return new Promise((resolve, reject) => {
    window.google!.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('Google Sign-In did not return a credential'));
        }
      },
    });

    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        reject(new Error('Google Sign-In was cancelled or blocked by the browser'));
      }
    });
  });
}
