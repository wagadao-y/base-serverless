import { writable } from 'svelte/store';

type AuthState = {
  isAuthenticated: boolean;
  user: null | {
    username: string;
    tokens?: {
      accessToken: string;
      idToken: string;
      refreshToken: string;
    };
  };
  mfaRequired: boolean;
  mfaSession: string | null;
  isInitialSetup: boolean;
  secretCode: string | null;
};

export const authStore = writable<AuthState>({
  isAuthenticated: false,
  user: null,
  mfaRequired: false,
  mfaSession: null,
  isInitialSetup: false,
  secretCode: null
});
