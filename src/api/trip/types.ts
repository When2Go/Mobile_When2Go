/**
 * Trip(여정) 도메인 API 타입.
 * `docs/references/api-schema.md` §2 trip 스키마를 그대로 옮긴 것.
 * 일회성 여정(즉시형) — 생성/목록/상세/삭제만 존재.
 */

/** 여정 상태. 백엔드에서 `IN_PROGRESS`/`CANCELLED`가 제거되어 3개로 축소됨. */
export type TripStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED';

/** POST /api/trips 요청 바디 (`TripCreateRequest`). */
export interface TripCreateRequest {
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  /** 도착 목표 절대 시각 (ISO 8601). */
  arrivalTime: string;
  bufferMinutes: number;
  /** 예상 소요 시간(초). 백엔드가 출발 시각 역산에 사용. */
  durationSeconds: number;
}

/** GET /api/trips 목록 항목 (`TripListResponse`). */
export interface TripListItem {
  tripId: number;
  originName: string;
  destName: string;
  /** 도착 목표 시각 (ISO 8601). */
  arrivalTime: string;
  /** 확정 출발 시각 (ISO 8601). 미산정 시 null. */
  finalDepartureTime: string | null;
  status: TripStatus;
}

/** 목적지 인근 추천 장소 항목 (최대 3개). */
export interface NearbyRecommendation {
  name: string;
  description: string;
  category: string;
}

/** GET /api/trips/{tripId} 상세 (`TripDetailResponse`). */
export interface TripDetail {
  tripId: number;
  originName: string;
  destName: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  arrivalTime: string;
  bufferMinutes: number;
  finalDepartureTime: string | null;
  status: TripStatus;
  /** 마지막 갱신 시각 (ISO 8601). */
  updatedAt: string;
  /** 목적지 인근 추천 장소 (일찍 도착 시 활용). 백엔드 미지원 시 undefined. */
  nearbyRecommendations?: NearbyRecommendation[];
}

/** GET /api/trips 쿼리 파라미터. status·date 둘 다 필수. */
export interface TripListQuery {
  status: TripStatus;
  /** "YYYY-MM-DD". */
  date: string;
}
