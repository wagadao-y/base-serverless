import { writable } from 'svelte/store';

// セッションの有効期限が切れたことをメモリ上に保持するストア
type SessionState = {
  isExpired: boolean;
};

export const sessionStore = writable<SessionState>({ isExpired: false });

export function setSessionExpired() {
  sessionStore.set({ isExpired: true });
}

export function resetSessionExpired() {
  sessionStore.set({ isExpired: false });
}
