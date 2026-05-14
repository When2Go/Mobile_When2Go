/**
 * Setup 화면 전용 상수.
 * - 경로 옵션 mock / 시간 휠 옵션 / 안전 버퍼 분 / 안내 문자열.
 * - 컴포넌트에 매직 넘버·문자열을 박지 않기 위함 (CLAUDE.md §컨벤션 3).
 */

export type RouteOptionId = 'subway_bus' | 'subway_only' | 'bus_only';

export interface RouteOption {
  id: RouteOptionId;
  label: string;
}

export const ROUTE_OPTIONS: readonly RouteOption[] = [
  { id: 'subway_bus', label: '지하철+버스' },
  { id: 'subway_only', label: '지하철만' },
  { id: 'bus_only', label: '버스만' },
] as const;

export const DEFAULT_ROUTE_OPTION: RouteOptionId = 'subway_bus';

/** 시간 휠: 1~12시. */
export const HOUR_OPTIONS: readonly number[] = Array.from({ length: 12 }, (_, i) => i + 1);

/** 분 휠: 5분 단위 (0, 5, 10, ..., 55). */
export const MINUTE_STEP = 5;
export const MINUTE_OPTIONS: readonly number[] = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, i) => i * MINUTE_STEP,
);

export type Period = '오전' | '오후';
export const PERIOD_OPTIONS: readonly Period[] = ['오전', '오후'] as const;

/** mock 단계의 도착 시간 기본값 — 오후 10:30. */
export const DEFAULT_PERIOD: Period = '오후';
export const DEFAULT_HOUR = 10;
export const DEFAULT_MINUTE = 30;

/** 안전 버퍼(분). 출발 시간에 더해지는 여유 시간. */
export const SAFETY_BUFFER_MIN = 10;
export const SAFETY_BUFFER_TEXT = `안전 버퍼 시간 ${SAFETY_BUFFER_MIN}분 적용됨`;

/** 시간 상한 안내. */
export const TIME_RANGE_NOTICE = '오전 06:00 ~ 오후 10:59 사이만 설정 가능';

/** 목적지 mock 기본값(검색에서 destination 파라미터를 넘기지 않은 경우). */
export const DEFAULT_DESTINATION = '강남역 2호선';

/** 라벨 토큰. */
export const ARRIVAL_LABEL = '도착';
export const DESTINATION_LABEL = '목적지';
export const ARRIVAL_SECTION_TITLE = '언제 도착할까요?';
export const ROUTE_SECTION_TITLE = '경로 옵션';
export const SCREEN_TITLE = '경로 설정';
export const CHANGE_BUTTON_LABEL = '변경';
export const SAFETY_BUFFER_ACTION_LABEL = '설정';
export const DEPART_BUTTON_LABEL = '출발 시간 계산하기';
