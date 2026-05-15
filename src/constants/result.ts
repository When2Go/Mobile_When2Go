/**
 * Result 화면 전용 상수.
 * - 다중 경로 카드 mock 데이터 / 배지 라벨 / 안내 문자열 / 안전 버퍼·리다이렉트 지연 상수.
 * - 컴포넌트에 매직 넘버·문자열을 박지 않기 위함 (CLAUDE.md §컨벤션 3).
 */

export type RouteBadgeId = 'optimal' | 'min_transfer' | 'min_fare';

export type TransitIcon = 'train' | 'bus';

export interface MockRoute {
  id: string;
  badge: RouteBadgeId;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  steps: readonly string[];
  transferCount: number;
  fareLabel: string;
  icon: TransitIcon;
}

export const BADGE_LABEL: Record<RouteBadgeId, string> = {
  optimal: '최적경로',
  min_transfer: '최소환승',
  min_fare: '최소요금',
};

export const MOCK_ROUTES: readonly MockRoute[] = [
  {
    id: 'optimal',
    badge: 'optimal',
    departureTime: '오후 1:15',
    arrivalTime: '오후 2:30',
    durationLabel: '1시간 15분',
    steps: ['인하대역', '오이도역', '강남역'],
    transferCount: 1,
    fareLabel: '1,850원',
    icon: 'train',
  },
  {
    id: 'min_transfer',
    badge: 'min_transfer',
    departureTime: '오후 1:10',
    arrivalTime: '오후 2:30',
    durationLabel: '1시간 20분',
    steps: ['인하대역', '신도림역', '강남역'],
    transferCount: 1,
    fareLabel: '1,950원',
    icon: 'train',
  },
  {
    id: 'min_fare',
    badge: 'min_fare',
    departureTime: '오후 1:00',
    arrivalTime: '오후 2:30',
    durationLabel: '1시간 30분',
    steps: ['현위치', '직행버스', '강남역'],
    transferCount: 0,
    fareLabel: '1,450원',
    icon: 'bus',
  },
] as const;

/** 라벨 토큰. */
export const SCREEN_TITLE = '경로 선택';
export const ARRIVAL_TARGET_PREFIX = '오후 2:30 도착을 위한';
export const SELECT_ROUTE_HEADING = '경로를 선택해 주세요';
export const RESERVATION_TITLE = '예약 확인';
export const NOTIFICATION_NOTICE = '출발 10분 전과 출발 시점에 알림을 드릴게요';
export const CONFIRM_LABEL = '예약 완료';
export const CONFIRMED_LABEL = '예약 완료!';
export const DEPART_SUFFIX = '출발';
export const ARRIVAL_SUFFIX_FORMAT = (arrivalTime: string): string => `${arrivalTime} 도착`;
export const TRANSFER_META_FORMAT = (durationLabel: string, transferCount: number): string =>
  `${durationLabel} · 환승 ${transferCount}회`;
export const FARE_LABEL_FORMAT = (fareLabel: string): string => `요금 ${fareLabel}`;
export const SAFETY_BUFFER_NOTICE_FORMAT = (minutes: number): string =>
  `+${minutes}분 안전 버퍼 적용`;

/** 예약 완료 후 schedule 화면으로 리다이렉트되기 전 머무는 시간(ms). */
export const CONFIRM_REDIRECT_DELAY_MS = 800;
