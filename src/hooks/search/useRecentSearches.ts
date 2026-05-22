import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Place } from '@/api/kakao/types';

const MAX_RECENT_COUNT = 10;

interface UseRecentSearchesResult {
  recentPlaces: Place[];
  addRecentPlace: (place: Place) => void;
  removeRecentPlace: (id: string) => void;
  clearAll: () => void;
}

export function useRecentSearches(): UseRecentSearchesResult {
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES)
      .then((raw) => {
        if (raw) {
          setRecentPlaces(JSON.parse(raw) as Place[]);
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((places: Place[]) => {
    AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(places)).catch(() => {});
  }, []);

  const addRecentPlace = useCallback(
    (place: Place) => {
      setRecentPlaces((prev) => {
        const filtered = prev.filter((p) => p.id !== place.id);
        const next = [place, ...filtered].slice(0, MAX_RECENT_COUNT);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeRecentPlace = useCallback(
    (id: string) => {
      setRecentPlaces((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setRecentPlaces([]);
    AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES).catch(() => {});
  }, []);

  return { recentPlaces, addRecentPlace, removeRecentPlace, clearAll };
}
