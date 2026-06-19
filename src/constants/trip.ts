/**
 * Trip 도메인 상수.
 */

import type { TripStatus } from '@/api/trip/types';

/** 출발지 기본 표시명 — setup에서 출발지는 항상 "현재 위치"(GPS). */
export const ORIGIN_CURRENT_LOCATION = '현재 위치';

/**
 * 일정 목록에서 조회할 상태 집합.
 * GET /api/trips는 단일 status만 받으므로, 한 날짜의 모든 일정을 모으려면
 * 상태별로 조회해 합친다. (생성 직후 상태가 PENDING/SCHEDULED 중 무엇이든 노출되도록)
 */
export const TRIP_LIST_STATUSES: readonly TripStatus[] = ['PENDING', 'SCHEDULED', 'COMPLETED'];
