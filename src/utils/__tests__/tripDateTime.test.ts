import {
  dateToParam,
  isoToDateKey,
  isoToHHmmKST,
  isoToKoreanTime,
  toISO8601KST,
} from '../tripDateTime';

describe('toISO8601KST', () => {
  // 정상
  it('"2026-06-17 09:00" → ISO 8601 (+09:00 오프셋)', () => {
    expect(toISO8601KST('2026-06-17 09:00')).toBe('2026-06-17T09:00:00+09:00');
  });

  it('"2026-05-22 13:30" → "2026-05-22T13:30:00+09:00"', () => {
    expect(toISO8601KST('2026-05-22 13:30')).toBe('2026-05-22T13:30:00+09:00');
  });

  // 경계
  it('자정 "2026-01-01 00:00"', () => {
    expect(toISO8601KST('2026-01-01 00:00')).toBe('2026-01-01T00:00:00+09:00');
  });
});

describe('isoToKoreanTime', () => {
  // 정상
  it('"+09:00" 오프셋 오전 시각 → "오전 9:00"', () => {
    expect(isoToKoreanTime('2026-06-17T09:00:00+09:00')).toBe('오전 9:00');
  });

  it('오후 시각 → "오후 1:30"', () => {
    expect(isoToKoreanTime('2026-06-17T13:30:00+09:00')).toBe('오후 1:30');
  });

  // 경계
  it('정오 → "오후 12:00"', () => {
    expect(isoToKoreanTime('2026-06-17T12:00:00+09:00')).toBe('오후 12:00');
  });

  it('자정 → "오전 12:00"', () => {
    expect(isoToKoreanTime('2026-06-17T00:00:00+09:00')).toBe('오전 12:00');
  });

  // 분기: UTC(Z) 표기도 동일 instant면 같은 KST
  it('UTC(Z) 표기 00:00Z → KST "오전 9:00"', () => {
    expect(isoToKoreanTime('2026-06-17T00:00:00Z')).toBe('오전 9:00');
  });
});

describe('isoToDateKey', () => {
  // 정상
  it('"+09:00" 오프셋 → 그 날짜 "YYYY-MM-DD"', () => {
    expect(isoToDateKey('2026-06-17T09:00:00+09:00')).toBe('2026-06-17');
  });

  // 경계: KST 늦은 밤도 같은 날짜 유지
  it('KST 23:30 → 같은 날짜', () => {
    expect(isoToDateKey('2026-06-17T23:30:00+09:00')).toBe('2026-06-17');
  });

  // 분기: UTC 표기에서 KST 변환 시 날짜 넘어감
  it('UTC 20:00Z → KST 다음날 05:00 → "2026-06-18"', () => {
    expect(isoToDateKey('2026-06-17T20:00:00Z')).toBe('2026-06-18');
  });
});

describe('isoToHHmmKST', () => {
  it('오전 → "07:12"', () => {
    expect(isoToHHmmKST('2026-06-17T07:12:00+09:00')).toBe('07:12');
  });

  it('오후 → "23:05"', () => {
    expect(isoToHHmmKST('2026-06-17T23:05:00+09:00')).toBe('23:05');
  });
});

describe('dateToParam', () => {
  // 정상
  it('Date → 로컬 "YYYY-MM-DD" (0패딩)', () => {
    expect(dateToParam(new Date(2026, 5, 7))).toBe('2026-06-07');
  });

  it('12월 31일', () => {
    expect(dateToParam(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});
