import { api } from '@/api/axios';
import type { ApiEnvelope } from '@/types/api.types';
import type {
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationListItem,
  ReservationUpdateRequest,
} from './types';

const RESERVATIONS_PATH = '/api/reservations';

export async function getReservations(): Promise<ReservationListItem[]> {
  const { data } = await api.get<ApiEnvelope<{ items: ReservationListItem[] }>>(RESERVATIONS_PATH);
  const items = data.data?.items;
  return Array.isArray(items) ? items : [];
}

export async function createReservation(
  req: ReservationCreateRequest,
): Promise<ReservationCreateResponse> {
  const { data } = await api.post<ApiEnvelope<ReservationCreateResponse>>(RESERVATIONS_PATH, req);
  return data.data!;
}

export async function updateReservation(
  reservationId: number,
  req: ReservationUpdateRequest,
): Promise<void> {
  await api.put<ApiEnvelope<unknown>>(`${RESERVATIONS_PATH}/${reservationId}`, req);
}

export async function deleteReservation(reservationId: number): Promise<void> {
  await api.delete(`${RESERVATIONS_PATH}/${reservationId}`);
}
