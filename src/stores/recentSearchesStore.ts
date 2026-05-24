import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Place } from '@/api/kakao/types';

const MAX_RECENT_COUNT = 10;

interface RecentSearchesState {
  recentPlaces: Place[];
  _isHydrated: boolean;
  hydrate: () => void;
  addRecentPlace: (place: Place) => void;
  removeRecentPlace: (id: string) => void;
  clearAll: () => void;
}

function saveToStorage(places: Place[]) {
  AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(places)).catch((e) => {
    if (__DEV__) console.warn('[recentSearchesStore] persist error', e);
  });
}

export const useRecentSearchesStore = create<RecentSearchesState>((set, get) => ({
  recentPlaces: [],
  _isHydrated: false,

  hydrate: () => {
    if (get()._isHydrated) return;
    set({ _isHydrated: true });
    AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES)
      .then((raw) => {
        if (raw) set({ recentPlaces: JSON.parse(raw) as Place[] });
      })
      .catch((e) => {
        if (__DEV__) console.warn('[recentSearchesStore] hydration error', e);
      });
  },

  addRecentPlace: (place) =>
    set((s) => {
      const next = [place, ...s.recentPlaces.filter((p) => p.id !== place.id)].slice(
        0,
        MAX_RECENT_COUNT,
      );
      saveToStorage(next);
      return { recentPlaces: next };
    }),

  removeRecentPlace: (id) =>
    set((s) => {
      const next = s.recentPlaces.filter((p) => p.id !== id);
      saveToStorage(next);
      return { recentPlaces: next };
    }),

  clearAll: () => {
    set({ recentPlaces: [] });
    AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES).catch((e) => {
      if (__DEV__) console.warn('[recentSearchesStore] clear error', e);
    });
  },
}));
