import { useEffect, useRef, useState } from 'react';

import { searchPlaces } from '@/api/kakao/search';
import type { Place } from '@/api/kakao/types';

const DEBOUNCE_MS = 300;

interface UsePlaceSearchResult {
  places: Place[];
  isLoading: boolean;
  error: string | null;
}

export function usePlaceSearch(query: string): UsePlaceSearchResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    if (query.trim() === '') {
      setPlaces([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await searchPlaces(query);
        setPlaces(result);
      } catch {
        setError('검색 중 오류가 발생했습니다.');
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  return { places, isLoading, error };
}
