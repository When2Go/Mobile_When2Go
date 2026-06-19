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
  console.log('[reservation] GET req');
  const { data } = await api.get<ApiEnvelope<ReservationListItem[]>>(RESERVATIONS_PATH);
  console.log('[reservation] GET res:', JSON.stringify(data, null, 2));
  return Array.isArray(data.data) ? data.data : [];
}

export async function createReservation(
  req: ReservationCreateRequest,
): Promise<ReservationCreateResponse> {
  console.log('[reservation] POST req:', JSON.stringify(req, null, 2));
  const { data } = await api.post<ApiEnvelope<ReservationCreateResponse>>(RESERVATIONS_PATH, req);
  console.log('[reservation] POST res:', JSON.stringify(data, null, 2));
  return data.data!;
}

export async function updateReservation(
  reservationId: number,
  req: ReservationUpdateRequest,
): Promise<void> {
  console.log('[reservation] PUT req id:', reservationId, JSON.stringify(req, null, 2));
  const { data } = await api.put<ApiEnvelope<unknown>>(`${RESERVATIONS_PATH}/${reservationId}`, req);
  console.log('[reservation] PUT res:', JSON.stringify(data, null, 2));
}

export async function deleteReservation(reservationId: number): Promise<void> {
  await api.delete(`${RESERVATIONS_PATH}/${reservationId}`);
}
