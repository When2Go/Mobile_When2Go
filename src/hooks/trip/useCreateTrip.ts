import { useState } from 'react';

import { createTrip } from '@/api/trip';
import type { TripCreateRequest } from '@/api/trip/types';
import type { ApiFailure } from '@/types/api.types';

interface UseCreateTripState {
  /** 성공 시 null, 실패 시 ApiFailure 반환(예외를 삼켜 호출처가 사유로 분기 가능). */
  create: (req: TripCreateRequest) => Promise<ApiFailure | null>;
  isCreating: boolean;
  error: ApiFailure | null;
}

/** result 확정 시 여정을 생성한다. */
export function useCreateTrip(): UseCreateTripState {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const create = async (req: TripCreateRequest): Promise<ApiFailure | null> => {
    setIsCreating(true);
    setError(null);
    try {
      await createTrip(req);
      setIsCreating(false);
      return null;
    } catch (err) {
      const failure = err as ApiFailure;
      setError(failure);
      setIsCreating(false);
      return failure;
    }
  };

  return { create, isCreating, error };
}
