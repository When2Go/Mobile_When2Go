import { clampIndex, indexToOffset, offsetToIndex } from '../wheelPicker';

const ITEM_HEIGHT = 44;

describe('wheelPicker / clampIndex', () => {
  // 정상
  test('범위 안의 index는 그대로 반환한다', () => {
    expect(clampIndex(3, 12)).toBe(3);
  });

  // 경계
  test('하한(0)·상한(length-1)은 그대로 반환한다', () => {
    expect(clampIndex(0, 12)).toBe(0);
    expect(clampIndex(11, 12)).toBe(11);
  });

  // 분기 — 하한 미만
  test('0 미만이면 0으로 clamp 한다', () => {
    expect(clampIndex(-1, 12)).toBe(0);
    expect(clampIndex(-100, 12)).toBe(0);
  });

  // 분기 — 상한 초과
  test('length-1 초과면 length-1로 clamp 한다', () => {
    expect(clampIndex(12, 12)).toBe(11);
    expect(clampIndex(999, 12)).toBe(11);
  });

  // 에러 방어 — length 0/음수
  test('length가 0 이하이면 0을 반환한다 (빈 옵션 방어)', () => {
    expect(clampIndex(5, 0)).toBe(0);
    expect(clampIndex(5, -3)).toBe(0);
  });

  // 에러 방어 — 비유한 index
  test('NaN·Infinity index는 0으로 방어한다', () => {
    expect(clampIndex(Number.NaN, 12)).toBe(0);
    expect(clampIndex(Number.POSITIVE_INFINITY, 12)).toBe(11);
    expect(clampIndex(Number.NEGATIVE_INFINITY, 12)).toBe(0);
  });
});

describe('wheelPicker / offsetToIndex', () => {
  // 정상
  test('offset이 itemHeight 배수면 정확한 index가 된다', () => {
    expect(offsetToIndex(0, ITEM_HEIGHT, 12)).toBe(0);
    expect(offsetToIndex(ITEM_HEIGHT * 3, ITEM_HEIGHT, 12)).toBe(3);
  });

  // 경계 — offset 0 / 마지막 항목
  test('offset 0은 첫 index, 마지막 항목 offset은 마지막 index', () => {
    expect(offsetToIndex(0, ITEM_HEIGHT, 12)).toBe(0);
    expect(offsetToIndex(ITEM_HEIGHT * 11, ITEM_HEIGHT, 12)).toBe(11);
  });

  // 경계 — 반올림 경계 (절반 지점)
  test('반올림 경계: 0.5칸 미만은 내림, 0.5칸 이상은 올림', () => {
    expect(offsetToIndex(ITEM_HEIGHT * 0.49, ITEM_HEIGHT, 12)).toBe(0);
    expect(offsetToIndex(ITEM_HEIGHT * 0.5, ITEM_HEIGHT, 12)).toBe(1);
    expect(offsetToIndex(ITEM_HEIGHT * 2.4, ITEM_HEIGHT, 12)).toBe(2);
    expect(offsetToIndex(ITEM_HEIGHT * 2.6, ITEM_HEIGHT, 12)).toBe(3);
  });

  // 분기 — clamp 상한 (오버스크롤)
  test('오버스크롤로 offset이 마지막을 넘어도 length-1로 clamp', () => {
    expect(offsetToIndex(ITEM_HEIGHT * 50, ITEM_HEIGHT, 12)).toBe(11);
  });

  // 분기 — clamp 하한 (음수 offset / 바운스)
  test('음수 offset(상단 바운스)은 0으로 clamp', () => {
    expect(offsetToIndex(-30, ITEM_HEIGHT, 12)).toBe(0);
    expect(offsetToIndex(-ITEM_HEIGHT * 5, ITEM_HEIGHT, 12)).toBe(0);
  });

  // 에러 방어 — itemHeight 0/음수, length 0
  test('itemHeight가 0 이하이면 0으로 방어한다 (0 나눗셈 방지)', () => {
    expect(offsetToIndex(100, 0, 12)).toBe(0);
    expect(offsetToIndex(100, -44, 12)).toBe(0);
  });

  test('length가 0이면 0을 반환한다', () => {
    expect(offsetToIndex(100, ITEM_HEIGHT, 0)).toBe(0);
  });
});

describe('wheelPicker / indexToOffset', () => {
  // 정상
  test('index * itemHeight 를 반환한다', () => {
    expect(indexToOffset(0, ITEM_HEIGHT)).toBe(0);
    expect(indexToOffset(3, ITEM_HEIGHT)).toBe(ITEM_HEIGHT * 3);
    expect(indexToOffset(11, ITEM_HEIGHT)).toBe(ITEM_HEIGHT * 11);
  });

  // 라운드트립 (offsetToIndex 와 역함수 관계)
  test('indexToOffset → offsetToIndex 라운드트립이 보존된다', () => {
    for (let i = 0; i < 12; i += 1) {
      expect(offsetToIndex(indexToOffset(i, ITEM_HEIGHT), ITEM_HEIGHT, 12)).toBe(i);
    }
  });

  // 에러 방어 — 음수 index / 비유한
  test('음수·NaN index는 0 offset으로 방어한다', () => {
    expect(indexToOffset(-2, ITEM_HEIGHT)).toBe(0);
    expect(indexToOffset(Number.NaN, ITEM_HEIGHT)).toBe(0);
  });
});
