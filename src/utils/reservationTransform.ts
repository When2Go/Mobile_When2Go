import type { RouteOptionId } from '@/constants/setup';
import type { Period } from '@/constants/setup';
import type { ApiRouteOption, RepeatDay } from '@/api/reservation/types';

const DAY_MAP: RepeatDay[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

/** days number[](0=일~6=토) → RepeatDay[] (API 풀네임 포맷). */
export function daysToRepeatDays(days: number[]): RepeatDay[] {
  return days.map((d) => DAY_MAP[d]);
}

/** 앱 내부 경로 옵션 → API RouteOption. 현재 대중교통 3종 모두 TRANSIT으로 매핑. */
export function routeOptionToApiOption(_option: RouteOptionId): ApiRouteOption {
  return 'TRANSIT';
}

/** 오전/오후 + 1~12시 + 분 → HH:mm 24시간 포맷. */
export function toArrivalTimeString(period: Period, hour: number, minute: number): string {
  let h24: number;
  if (period === '오전') {
    h24 = hour === 12 ? 0 : hour;
  } else {
    h24 = hour === 12 ? 12 : hour + 12;
  }
  const hh = String(h24).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm}`;
}
