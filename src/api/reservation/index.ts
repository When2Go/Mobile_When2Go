import { api } from '@/api/axios';
import type { ApiEnvelope } from '@/types/api.types';
import type { ReservationCreateRequest, ReservationCreateResponse } from './types';

const RESERVATIONS_PATH = '/api/reservations';

export async function createReservation(
  req: ReservationCreateRequest,
): Promise<ReservationCreateResponse> {
  const { data } = await api.post<ApiEnvelope<ReservationCreateResponse>>(RESERVATIONS_PATH, req);
  return data.data!;
}

export async function deleteReservation(reservationId: number): Promise<void> {
  await api.delete(`${RESERVATIONS_PATH}/${reservationId}`);
}
