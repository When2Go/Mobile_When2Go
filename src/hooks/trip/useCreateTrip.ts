import { useState } from 'react';

import { createTrip } from '@/api/trip';
import type { TripCreateRequest } from '@/api/trip/types';
import type { ApiFailure } from '@/types/api.types';

interface UseCreateTripState {
  /** 생성 성공 시 true, 실패 시 false 반환(예외를 삼켜 호출처 분기를 단순화). */
  create: (req: TripCreateRequest) => Promise<boolean>;
  isCreating: boolean;
  error: ApiFailure | null;
}

/** result 확정 시 여정을 생성한다. */
export function useCreateTrip(): UseCreateTripState {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const create = async (req: TripCreateRequest): Promise<boolean> => {
    setIsCreating(true);
    setError(null);
    try {
      await createTrip(req);
      setIsCreating(false);
      return true;
    } catch (err) {
      setError(err as ApiFailure);
      setIsCreating(false);
      return false;
    }
  };

  return { create, isCreating, error };
}
