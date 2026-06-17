import { api } from '@/api/axios';
import type { ApiEnvelope, ApiFailure } from '@/types/api.types';
import type { TripCreateRequest, TripDetail, TripListItem, TripListQuery } from './types';

const TRIPS_URL = '/api/trips';

/**
 * 봉투가 success:false(HTTP 2xx인데 비즈니스 실패)일 때 ApiFailure로 reject.
 * HTTP 에러(4xx/5xx)는 interceptors/error.ts가 이미 ApiFailure로 정규화한다.
 */
function rejectFromEnvelope(message: string | null): Promise<never> {
  const failure: ApiFailure = {
    ok: false,
    reason: 'UNKNOWN',
    ...(message ? { message } : {}),
  };
  return Promise.reject(failure);
}

/** POST /api/trips — 여정 생성. */
export async function createTrip(req: TripCreateRequest): Promise<void> {
  const { data: envelope } = await api.post<ApiEnvelope<unknown>>(TRIPS_URL, req);
  if (!envelope.success) return rejectFromEnvelope(envelope.message);
}

/** GET /api/trips — 목록 (status·date 둘 다 필수). */
export async function getTrips(query: TripListQuery): Promise<TripListItem[]> {
  const { data: envelope } = await api.get<ApiEnvelope<TripListItem[]>>(TRIPS_URL, {
    params: query,
  });
  if (!envelope.success || !envelope.data) return rejectFromEnvelope(envelope.message);
  return envelope.data;
}

/** GET /api/trips/{tripId} — 상세. */
export async function getTripDetail(tripId: number): Promise<TripDetail> {
  const { data: envelope } = await api.get<ApiEnvelope<TripDetail>>(`${TRIPS_URL}/${tripId}`);
  if (!envelope.success || !envelope.data) return rejectFromEnvelope(envelope.message);
  return envelope.data;
}

/** DELETE /api/trips/{tripId} — 삭제(취소). */
export async function deleteTrip(tripId: number): Promise<void> {
  const { data: envelope } = await api.delete<ApiEnvelope<null>>(`${TRIPS_URL}/${tripId}`);
  if (!envelope.success) return rejectFromEnvelope(envelope.message);
}
