import {
  daysToRepeatDays,
  toArrivalTimeString,
  routeOptionToApiOption,
  repeatDaysShortToNumbers,
  parseArrivalTimeString,
  routeOptionToApiPutOption,
} from '../reservationTransform';

describe('daysToRepeatDays', () => {
  test('0~6 숫자 배열을 풀네임 RepeatDay 배열로 변환한다', () => {
    expect(daysToRepeatDays([0, 1, 2, 3, 4, 5, 6])).toEqual([
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ]);
  });

  test('평일(1~5)만 변환한다', () => {
    expect(daysToRepeatDays([1, 2, 3, 4, 5])).toEqual([
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
    ]);
  });

  test('단일 요일을 변환한다', () => {
    expect(daysToRepeatDays([0])).toEqual(['SUNDAY']);
    expect(daysToRepeatDays([6])).toEqual(['SATURDAY']);
  });

  test('빈 배열이면 빈 배열을 반환한다', () => {
    expect(daysToRepeatDays([])).toEqual([]);
  });

  test('순서를 유지한다', () => {
    expect(daysToRepeatDays([5, 6])).toEqual(['FRIDAY', 'SATURDAY']);
  });
});

describe('toArrivalTimeString', () => {
  test('오전 9시 0분 → 09:00', () => {
    expect(toArrivalTimeString('오전', 9, 0)).toBe('09:00');
  });

  test('오후 1시 30분 → 13:30', () => {
    expect(toArrivalTimeString('오후', 1, 30)).toBe('13:30');
  });

  test('오후 12시 0분(정오) → 12:00', () => {
    expect(toArrivalTimeString('오후', 12, 0)).toBe('12:00');
  });

  test('오전 12시 0분(자정) → 00:00', () => {
    expect(toArrivalTimeString('오전', 12, 0)).toBe('00:00');
  });

  test('오전 11시 59분 → 11:59', () => {
    expect(toArrivalTimeString('오전', 11, 59)).toBe('11:59');
  });

  test('오후 11시 59분 → 23:59', () => {
    expect(toArrivalTimeString('오후', 11, 59)).toBe('23:59');
  });

  test('한 자리 분을 두 자리로 패딩한다', () => {
    expect(toArrivalTimeString('오전', 1, 5)).toBe('01:05');
  });

  test('오전 1시 0분 → 01:00', () => {
    expect(toArrivalTimeString('오전', 1, 0)).toBe('01:00');
  });
});

describe('routeOptionToApiOption', () => {
  test('subway_bus → TRANSIT', () => {
    expect(routeOptionToApiOption('subway_bus')).toBe('TRANSIT');
  });

  test('subway_only → TRANSIT', () => {
    expect(routeOptionToApiOption('subway_only')).toBe('TRANSIT');
  });

  test('bus_only → TRANSIT', () => {
    expect(routeOptionToApiOption('bus_only')).toBe('TRANSIT');
  });
});

describe('repeatDaysShortToNumbers', () => {
  test('3자 약어 배열을 숫자 배열로 변환한다', () => {
    expect(repeatDaysShortToNumbers(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
  });

  test('평일만 변환한다', () => {
    expect(repeatDaysShortToNumbers(['MON', 'TUE', 'WED', 'THU', 'FRI'])).toEqual([1, 2, 3, 4, 5]);
  });

  test('빈 배열이면 빈 배열을 반환한다', () => {
    expect(repeatDaysShortToNumbers([])).toEqual([]);
  });

  test('순서를 유지한다', () => {
    expect(repeatDaysShortToNumbers(['SAT', 'SUN'])).toEqual([6, 0]);
  });
});

describe('parseArrivalTimeString', () => {
  test('09:00 → 오전 9시 0분', () => {
    expect(parseArrivalTimeString('09:00')).toEqual({
      arrivalPeriod: '오전',
      arrivalHour: 9,
      arrivalMinute: 0,
    });
  });

  test('13:30 → 오후 1시 30분', () => {
    expect(parseArrivalTimeString('13:30')).toEqual({
      arrivalPeriod: '오후',
      arrivalHour: 1,
      arrivalMinute: 30,
    });
  });

  test('00:00 → 오전 12시 0분(자정)', () => {
    expect(parseArrivalTimeString('00:00')).toEqual({
      arrivalPeriod: '오전',
      arrivalHour: 12,
      arrivalMinute: 0,
    });
  });

  test('12:00 → 오후 12시 0분(정오)', () => {
    expect(parseArrivalTimeString('12:00')).toEqual({
      arrivalPeriod: '오후',
      arrivalHour: 12,
      arrivalMinute: 0,
    });
  });

  test('23:59 → 오후 11시 59분', () => {
    expect(parseArrivalTimeString('23:59')).toEqual({
      arrivalPeriod: '오후',
      arrivalHour: 11,
      arrivalMinute: 59,
    });
  });

  test('01:05 → 오전 1시 5분', () => {
    expect(parseArrivalTimeString('01:05')).toEqual({
      arrivalPeriod: '오전',
      arrivalHour: 1,
      arrivalMinute: 5,
    });
  });

  test('toArrivalTimeString 역변환 왕복 일치', () => {
    expect(parseArrivalTimeString(toArrivalTimeString('오후', 3, 45))).toEqual({
      arrivalPeriod: '오후',
      arrivalHour: 3,
      arrivalMinute: 45,
    });
  });
});

describe('routeOptionToApiPutOption', () => {
  test('subway_bus → OPTIMAL', () => {
    expect(routeOptionToApiPutOption('subway_bus')).toBe('OPTIMAL');
  });

  test('subway_only → SUBWAY_FIRST', () => {
    expect(routeOptionToApiPutOption('subway_only')).toBe('SUBWAY_FIRST');
  });

  test('bus_only → BUS_ONLY', () => {
    expect(routeOptionToApiPutOption('bus_only')).toBe('BUS_ONLY');
  });
});
