import { formatUTCToKoreanTime, toDateTimeString, toHHmm } from '../timeFormat';

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
