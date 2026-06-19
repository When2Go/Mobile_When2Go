/**
 * Schedule 화면 전용 상수.
 * - 요일 라벨 / 스와이프 매직 넘버를 모아둔다.
 * - 컴포넌트에 숫자 리터럴을 직접 박지 않기 위함 (CLAUDE.md §컨벤션 3).
 */

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 스와이프 카드 매직 넘버.
 * 시안의 motion.div drag 임계값을 RN Reanimated dp 단위로 그대로 옮겨왔다.
 */
export const SWIPE_DELETE_THRESHOLD = -200;
export const SWIPE_REVEAL_THRESHOLD = -40;
export const DELETE_BTN_WIDTH = 88;
export const CARD_OFFSCREEN = 500;
export const DELETE_ANIM_MS = 220;
export const SETTLE_ANIM_MS = 200;
export const SWIPE_ACTIVATE_X = 10;
