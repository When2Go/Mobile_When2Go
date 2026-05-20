import { resolveRepeatBufferMinutes } from '../repeatBuffer';
import type { RepeatItem } from '@/types/repeat.types';

function makeItem(overrides: Partial<RepeatItem> = {}): RepeatItem {
  return {
    id: 1,
    name: '출근',
    origin: '집',
    destination: '회사',
    days: [1, 2, 3, 4, 5],
    arrivalPeriod: '오전',
    arrivalHour: 9,
    arrivalMinute: 0,
    routeOption: 'subway_bus',
    enabled: true,
    ...overrides,
  };
}

describe('resolveRepeatBufferMinutes', () => {
  test('safetyBufferMin 이 명시되면 그 값을 반환한다', () => {
    const item = makeItem({ safetyBufferMin: 15 });
    expect(resolveRepeatBufferMinutes(item, 10)).toBe(15);
  });

  test('safetyBufferMin 이 undefined 면 전역값을 fallback 으로 반환한다', () => {
    const item = makeItem({ safetyBufferMin: undefined });
    expect(resolveRepeatBufferMinutes(item, 10)).toBe(10);
  });

  test('safetyBufferMin 필드 자체가 없어도 전역값을 반환한다', () => {
    const item = makeItem();
    expect(resolveRepeatBufferMinutes(item, 20)).toBe(20);
  });

  test('safetyBufferMin 이 0 이어도 0 을 그대로 반환한다 (fallback 으로 떨어지지 않음)', () => {
    const item = makeItem({ safetyBufferMin: 0 });
    expect(resolveRepeatBufferMinutes(item, 25)).toBe(0);
  });

  test('전역값이 0 이고 명시값이 undefined 면 0 을 반환한다', () => {
    const item = makeItem({ safetyBufferMin: undefined });
    expect(resolveRepeatBufferMinutes(item, 0)).toBe(0);
  });

  test('명시값이 있으면 전역값을 바꿔도 영향을 받지 않는다', () => {
    const item = makeItem({ safetyBufferMin: 5 });
    expect(resolveRepeatBufferMinutes(item, 0)).toBe(5);
    expect(resolveRepeatBufferMinutes(item, 30)).toBe(5);
  });
});
