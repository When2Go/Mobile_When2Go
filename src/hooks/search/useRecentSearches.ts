import { useEffect } from 'react';

import { useRecentSearchesStore } from '@/stores/recentSearchesStore';

export function useRecentSearches() {
  const { recentPlaces, addRecentPlace, removeRecentPlace, clearAll, hydrate } =
    useRecentSearchesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { recentPlaces, addRecentPlace, removeRecentPlace, clearAll };
}
