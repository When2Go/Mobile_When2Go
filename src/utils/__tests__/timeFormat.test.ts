import { calcArrivalDisplay, calcDepartureTime, formatUTCToKoreanTime, toDateTimeString, toHHmm } from '../timeFormat';

describe('toHHmm', () => {
  // 정상
  it('오전 6:30 → "06:30"', () => {
    expect(toHHmm('오전', 6, 30)).toBe('06:30');
  });

  it('오후 1:15 → "13:15"', () => {
    expect(toHHmm('오후', 1, 15)).toBe('13:15');
  });

  // 경계
  it('오전 12:00 (자정) → "00:00"', () => {
    expect(toHHmm('오전', 12, 0)).toBe('00:00');
  });

  it('오후 12:00 (정오) → "12:00"', () => {
    expect(toHHmm('오후', 12, 0)).toBe('12:00');
  });

  it('오후 11:59 → "23:59"', () => {
    expect(toHHmm('오후', 11, 59)).toBe('23:59');
  });

  // 분 0패딩
  it('오전 9:05 → "09:05"', () => {
    expect(toHHmm('오전', 9, 5)).toBe('09:05');
  });
});

describe('toDateTimeString', () => {
  it('날짜 + 오후 1:30 → "2026-05-22 13:30"', () => {
    expect(toDateTimeString(new Date(2026, 4, 22), '오후', 1, 30)).toBe('2026-05-22 13:30');
  });

  it('날짜 + 오전 9:05 → "2026-05-22 09:05"', () => {
    expect(toDateTimeString(new Date(2026, 4, 22), '오전', 9, 5)).toBe('2026-05-22 09:05');
  });

  it('월·일 0패딩 → "2026-01-03 08:00"', () => {
    expect(toDateTimeString(new Date(2026, 0, 3), '오전', 8, 0)).toBe('2026-01-03 08:00');
  });
});

describe('calcDepartureTime', () => {
  // 정상: 22:30 도착, 45분(2700s), 버퍼 10분 → 21:35 출발
  it('도착 시각 - duration - 버퍼 = 출발 시각', () => {
    expect(calcDepartureTime('2026-06-06 22:30', 2700, 10)).toBe('오후 9:35');
  });

  // 버퍼 0
  it('버퍼 0이면 도착 시각 - duration만 빼다', () => {
    expect(calcDepartureTime('2026-05-22 14:30', 1800, 0)).toBe('오후 2:00');
  });

  // 경계: 자정 넘어서 역산
  it('역산 결과가 자정을 넘으면 전날 시각으로 표시', () => {
    expect(calcDepartureTime('2026-06-06 00:10', 900, 5)).toBe('오후 11:50');
  });

  // 분 0패딩
  it('분이 한 자리면 0패딩', () => {
    expect(calcDepartureTime('2026-06-06 10:07', 300, 2)).toBe('오전 10:00');
  });
});

describe('calcArrivalDisplay', () => {
  // 정상: 도착 목표 22:30, 버퍼 10분 → 실제 도착 22:20
  it('도착 목표 - 버퍼 = 실제 도착 시각', () => {
    expect(calcArrivalDisplay('2026-06-06 22:30', 10)).toBe('오후 10:20');
  });

  // 버퍼 0이면 목표 시각 그대로
  it('버퍼 0이면 목표 시각 그대로 반환', () => {
    expect(calcArrivalDisplay('2026-05-22 14:30', 0)).toBe('오후 2:30');
  });
});

describe('formatUTCToKoreanTime', () => {
  // 정상: UTC 오전 4:13 (KST 오후 1:13)
  it('UTC 04:13:11Z → 오후 1:13', () => {
    expect(formatUTCToKoreanTime('2026-05-22T04:13:11Z')).toBe('오후 1:13');
  });

  // 경계: 자정 직전 UTC (KST 오전)
  it('UTC 15:00:00Z (KST 00:00) → 오전 12:00', () => {
    expect(formatUTCToKoreanTime('2026-05-22T15:00:00Z')).toBe('오전 12:00');
  });

  // UTC 03:00 (KST 12:00 정오)
  it('UTC 03:00:00Z (KST 12:00) → 오후 12:00', () => {
    expect(formatUTCToKoreanTime('2026-05-22T03:00:00Z')).toBe('오후 12:00');
  });

  // 분 0패딩
  it('UTC 01:05:00Z (KST 10:05) → 오전 10:05', () => {
    expect(formatUTCToKoreanTime('2026-05-22T01:05:00Z')).toBe('오전 10:05');
  });
});
