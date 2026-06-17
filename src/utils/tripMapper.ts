/**
 * Trip API 응답 → 화면 도메인(`ScheduleItem`) 매핑.
 * 목록 응답엔 경로 단계·updatedAt이 없어, route는 "출발지 → 도착지"로 요약하고
 * updatedAt은 null로 둔다(상세 응답에서만 채움).
 */

import type { TripDetail, TripListItem, TripStatus } from '@/api/trip/types';
import type { ScheduleItem, ScheduleStatus } from '@/types/schedule.types';
import { isoToDateKey, isoToHHmmKST, isoToKoreanTime } from './tripDateTime';

const ROUTE_JOINER = ' → ';
const NO_DEPARTURE_LABEL = '-';

/**
 * 백엔드 TripStatus → 화면 표시 상태.
 * SCHEDULED(출발 시각 확정·알림 스케줄링 중)가 화면상 "진행중"에 해당한다.
 */
const STATUS_LABEL: Record<TripStatus, ScheduleStatus> = {
  PENDING: '예정',
  SCHEDULED: '진행중',
  COMPLETED: '완료',
};

export function tripStatusToKorean(status: TripStatus): ScheduleStatus {
  return STATUS_LABEL[status];
}

function departureLabel(finalDepartureTime: string | null): string {
  return finalDepartureTime ? isoToKoreanTime(finalDepartureTime) : NO_DEPARTURE_LABEL;
}

/** GET /api/trips 목록 항목 → ScheduleItem. */
export function tripListItemToSchedule(item: TripListItem): ScheduleItem {
  return {
    id: item.tripId,
    title: item.destName,
    destination: item.destName,
    arrivalTime: isoToKoreanTime(item.arrivalTime),
    departureTime: departureLabel(item.finalDepartureTime),
    status: tripStatusToKorean(item.status),
    route: `${item.originName}${ROUTE_JOINER}${item.destName}`,
    isActive: item.status === 'SCHEDULED',
    updatedAt: null,
    from: item.originName,
    to: item.destName,
    date: isoToDateKey(item.arrivalTime),
  };
}

/**
 * 상태별로 따로 조회한 목록들을 하나로 합쳐 도착 시각 오름차순 ScheduleItem 배열로 만든다.
 * GET /api/trips가 단일 status만 받기 때문에 status별 결과를 모아 정렬한다.
 * (한 trip은 상태가 하나뿐이라 중복 없음)
 */
export function mergeTripListsToSchedules(lists: TripListItem[][]): ScheduleItem[] {
  return lists
    .flat()
    .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))
    .map(tripListItemToSchedule);
}

/** GET /api/trips/{tripId} 상세 → ScheduleItem. 목록 대비 updatedAt을 추가로 채운다. */
export function tripDetailToSchedule(detail: TripDetail): ScheduleItem {
  return {
    id: detail.tripId,
    title: detail.destName,
    destination: detail.destName,
    arrivalTime: isoToKoreanTime(detail.arrivalTime),
    departureTime: departureLabel(detail.finalDepartureTime),
    status: tripStatusToKorean(detail.status),
    route: `${detail.originName}${ROUTE_JOINER}${detail.destName}`,
    isActive: detail.status === 'SCHEDULED',
    updatedAt: isoToHHmmKST(detail.updatedAt),
    from: detail.originName,
    to: detail.destName,
    date: isoToDateKey(detail.arrivalTime),
  };
}
