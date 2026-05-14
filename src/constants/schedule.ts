/**
 * Schedule 화면 전용 상수.
 * - 요일 라벨 / mock 데이터 / 매직 넘버를 모아둔다.
 * - 컴포넌트에 숫자 리터럴을 직접 박지 않기 위함 (CLAUDE.md §컨벤션 3).
 */

import type { ScheduleItem } from '@/types/schedule.types';

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 현재는 "오늘 노출"만 mock으로 보여준다.
 * 다른 날짜를 선택하면 EmptyState로 빠지도록 화면 측에서 필터링한다.
 */
export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 1,
    title: '출근',
    destination: '강남역 2호선',
    arrivalTime: '오전 9:00',
    departureTime: '오전 7:45',
    status: '완료',
    route: '인하대역 → 오이도역 → 강남역',
    isActive: false,
    updatedAt: '07:12',
    from: '인하대학교',
    to: '강남역',
  },
  {
    id: 2,
    title: '점심 약속',
    destination: '신논현역 카페',
    arrivalTime: '오후 12:30',
    departureTime: '오후 12:10',
    status: '진행중',
    route: '강남역 → 신논현역',
    isActive: true,
    updatedAt: null,
    from: '강남역',
    to: '신논현역',
  },
  {
    id: 3,
    title: '퇴근',
    destination: '인하대 정문',
    arrivalTime: '오후 6:00',
    departureTime: '오후 4:45',
    status: '예정',
    route: '강남역 → 오이도역 → 인하대역',
    isActive: false,
    updatedAt: null,
    from: '강남역',
    to: '인하대학교',
  },
];

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

/** 캘린더 dot 표시 — mock 단계에서는 실제 데이터가 있는 날(=오늘)에만 노출. */
export const MOCK_MARKED_OFFSETS_FROM_TODAY = [0] as const;
