import { writable } from 'svelte/store';

type initState = {
  isInitialized: boolean;
};

export const initStore = writable<initState>({ isInitialized: false });
