import { writable } from 'svelte/store';

// 認証状態をメモリ上に保持するストア
type AuthState = {
  isAuthenticated: boolean;
  userId: string;
};

// 初期状態は未認証
const initialState: AuthState = {
  isAuthenticated: false,
  userId: ''
};

export const authStore = writable<AuthState>(initialState);
