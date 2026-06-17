import { useEffect, useState } from 'react';

import { getTripDetail } from '@/api/trip';
import { tripDetailToSchedule } from '@/utils/tripMapper';
import type { ApiFailure } from '@/types/api.types';
import type { ScheduleItem } from '@/types/schedule.types';

interface UseTripDetailState {
  detail: ScheduleItem | null;
  isLoading: boolean;
  error: ApiFailure | null;
}

/**
 * 상세 시트가 열릴 때 해당 여정 상세를 조회한다.
 * tripId가 null이면 조회하지 않는다(시트 닫힘).
 */
export function useTripDetail(tripId: number | null): UseTripDetailState {
  const [detail, setDetail] = useState<ScheduleItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  useEffect(() => {
    if (tripId === null) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    // 다른 카드로 전환 시 직전 trip 상세가 잠깐 노출되지 않도록 먼저 비운다.
    // 로딩 동안엔 화면이 방금 탭한 목록 데이터로 폴백된다.
    setDetail(null);
    setIsLoading(true);
    setError(null);

    getTripDetail(tripId)
      .then((data) => {
        if (cancelled) return;
        setDetail(tripDetailToSchedule(data));
        setIsLoading(false);
      })
      .catch((err: ApiFailure) => {
        if (cancelled) return;
        setDetail(null);
        setError(err);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return { detail, isLoading, error };
}
