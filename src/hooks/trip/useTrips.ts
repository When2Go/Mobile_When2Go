import { useCallback, useEffect, useState } from 'react';

import { getTrips } from '@/api/trip';
import type { TripListItem } from '@/api/trip/types';
import { TRIP_LIST_STATUSES } from '@/constants/trip';
import { dateToParam } from '@/utils/tripDateTime';
import { mergeTripListsToSchedules } from '@/utils/tripMapper';
import type { ApiFailure } from '@/types/api.types';
import type { ScheduleItem } from '@/types/schedule.types';

interface UseTripsState {
  trips: ScheduleItem[];
  isLoading: boolean;
  error: ApiFailure | null;
  refetch: () => void;
}

/**
 * 선택 날짜의 일정 목록을 조회한다.
 * GET /api/trips가 단일 status만 받으므로 상태별로 병렬 조회 후 합쳐 정렬한다.
 * 날짜가 바뀔 때마다 자동 재조회.
 */
export function useTrips(date: Date | null): UseTripsState {
  const [trips, setTrips] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const dateKey = date ? dateToParam(date) : null;

  const fetchTrips = useCallback(() => {
    if (!dateKey) return undefined;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // status별 호출이 강제되는 구조라, 일부 상태 조회가 실패해도 성공한 목록은 살린다.
    // 전부 실패일 때만 에러로 처리.
    Promise.allSettled(
      TRIP_LIST_STATUSES.map((status) => getTrips({ status, date: dateKey })),
    ).then((results) => {
      if (cancelled) return;
      const fulfilled = results
        .filter((r): r is PromiseFulfilledResult<TripListItem[]> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (fulfilled.length === 0) {
        const rejected = results.find((r) => r.status === 'rejected');
        setTrips([]);
        setError((rejected as PromiseRejectedResult | undefined)?.reason ?? null);
        setIsLoading(false);
        return;
      }

      setTrips(mergeTripListsToSchedules(fulfilled));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  useEffect(() => fetchTrips(), [fetchTrips]);

  return { trips, isLoading, error, refetch: fetchTrips };
}
