/**
 * iOS 스타일 휠 픽커의 순수 계산 헬퍼.
 * - 스크롤 offset ↔ 선택 index 변환만 담당. RN/뷰 의존성 없음 → TDD 대상.
 * - 모든 함수는 비순환(clamp) 정책: 끝단을 넘어가도 처음/끝으로 stop.
 */

/**
 * index 를 [0, length-1] 로 clamp.
 * - length 가 0 이하(빈 옵션)거나 index 가 NaN 이면 0 으로 방어.
 */
export function clampIndex(index: number, length: number): number {
  if (!Number.isFinite(length) || length <= 0) return 0;
  const maxIndex = length - 1;
  if (Number.isNaN(index)) return 0;
  if (index < 0) return 0;
  if (index > maxIndex) return maxIndex;
  // 소수 offset 라운딩 잔여를 정수화 (방어적, 보통 호출부에서 이미 정수).
  return Math.round(index);
}

/**
 * 세로 스크롤 offsetY → 중앙에 놓일 항목 index.
 * - 가장 가까운 칸으로 반올림 후 [0, length-1] clamp.
 * - itemHeight 0 이하(0 나눗셈)·length 0 이면 0 으로 방어.
 */
export function offsetToIndex(offsetY: number, itemHeight: number, length: number): number {
  if (!Number.isFinite(itemHeight) || itemHeight <= 0) return 0;
  if (!Number.isFinite(length) || length <= 0) return 0;
  if (!Number.isFinite(offsetY)) return 0;
  const rawIndex = Math.round(offsetY / itemHeight);
  return clampIndex(rawIndex, length);
}

/**
 * 선택 index → 그 항목을 중앙에 놓기 위한 스크롤 offsetY.
 * - 상·하단 스페이서가 ITEM_HEIGHT * VISIBLE_SIDE_COUNT 라는 전제하에
 *   contentOffset.y = index * itemHeight 면 항목이 중앙 라인에 온다.
 * - 음수·NaN index 는 0 으로 방어.
 */
export function indexToOffset(index: number, itemHeight: number): number {
  if (!Number.isFinite(itemHeight) || itemHeight <= 0) return 0;
  if (!Number.isFinite(index) || index < 0) return 0;
  return Math.round(index) * itemHeight;
}
