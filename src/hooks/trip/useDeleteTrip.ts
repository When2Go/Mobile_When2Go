import { useState } from 'react';

import { deleteTrip } from '@/api/trip';
import type { ApiFailure } from '@/types/api.types';

interface UseDeleteTripState {
  /** 삭제 성공 시 true, 실패 시 false 반환. */
  remove: (tripId: number) => Promise<boolean>;
  isDeleting: boolean;
  error: ApiFailure | null;
}

/** 일정 삭제(취소). 목록·상세 양쪽에서 공용. */
export function useDeleteTrip(): UseDeleteTripState {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const remove = async (tripId: number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTrip(tripId);
      setIsDeleting(false);
      return true;
    } catch (err) {
      setError(err as ApiFailure);
      setIsDeleting(false);
      return false;
    }
  };

  return { remove, isDeleting, error };
}
