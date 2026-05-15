import type { Period, RouteOptionId } from '@/constants/setup';

/**
 * 반복 예약 단건.
 * - days: 0(일) ~ 6(토). 시안의 DAYS 인덱스와 일치.
 * - arrivalPeriod / Hour / Minute: setup `TimeWheelPicker`와 동일 구조 (mock).
 * - routeOption: `ROUTE_OPTIONS`의 id를 재사용.
 */
export interface RepeatItem {
  id: number;
  name: string;
  origin: string;
  destination: string;
  days: number[];
  arrivalPeriod: Period;
  arrivalHour: number;
  arrivalMinute: number;
  routeOption: RouteOptionId;
  enabled: boolean;
}

/** 폼은 id/enabled를 제외한 나머지. */
export type RepeatFormData = Omit<RepeatItem, 'id' | 'enabled'>;
