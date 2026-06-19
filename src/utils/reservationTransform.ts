import type { RouteOptionId } from '@/constants/setup';
import type { Period } from '@/constants/setup';
import type { ApiRouteOption, PutRouteOption, RepeatDay, RepeatDayShort } from '@/api/reservation/types';

const DAY_MAP: RepeatDay[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const SHORT_DAY_MAP: Record<RepeatDayShort, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

/** days number[](0=일~6=토) → RepeatDay[] (API 풀네임 포맷). */
export function daysToRepeatDays(days: number[]): RepeatDay[] {
  return days.map((d) => DAY_MAP[d]);
}

/** RepeatDayShort[](GET 3자 약어) → days number[](0=일~6=토). */
export function repeatDaysShortToNumbers(days: RepeatDayShort[]): number[] {
  return days.map((d) => SHORT_DAY_MAP[d]);
}

/** RepeatDay[](GET 풀네임 MONDAY~SUNDAY) → days number[](0=일~6=토). */
export function repeatDaysToNumbers(days: RepeatDay[]): number[] {
  return days.map((d) => DAY_MAP.indexOf(d));
}

/** 앱 내부 경로 옵션 → POST API RouteOption. 대중교통 3종 모두 TRANSIT으로 매핑. */
export function routeOptionToApiOption(_option: RouteOptionId): ApiRouteOption {
  return 'TRANSIT';
}

/** 앱 내부 경로 옵션 → PUT API RouteOption (POST와 enum이 다름). */
export function routeOptionToApiPutOption(option: RouteOptionId): PutRouteOption {
  const map: Record<RouteOptionId, PutRouteOption> = {
    subway_bus: 'OPTIMAL',
    subway_only: 'SUBWAY_FIRST',
    bus_only: 'BUS_ONLY',
  };
  return map[option];
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

/** HH:mm 24시간 포맷 → 오전/오후 + 1~12시 + 분. toArrivalTimeString의 역함수. */
export function parseArrivalTimeString(time: string): {
  arrivalPeriod: Period;
  arrivalHour: number;
  arrivalMinute: number;
} {
  const [hStr, mStr] = time.split(':');
  const h24 = parseInt(hStr, 10);
  const arrivalMinute = parseInt(mStr, 10);

  if (h24 === 0) {
    return { arrivalPeriod: '오전', arrivalHour: 12, arrivalMinute };
  }
  if (h24 < 12) {
    return { arrivalPeriod: '오전', arrivalHour: h24, arrivalMinute };
  }
  if (h24 === 12) {
    return { arrivalPeriod: '오후', arrivalHour: 12, arrivalMinute };
  }
  return { arrivalPeriod: '오후', arrivalHour: h24 - 12, arrivalMinute };
}
