/**
 * 반복 예약 화면 전용 상수.
 * - 매직 넘버·문자열 박지 않기 위한 단일 진실 원천 (CLAUDE.md §컨벤션 3).
 * - 경로 옵션은 setup.ts의 ROUTE_OPTIONS를 그대로 재사용.
 */

import { DEFAULT_HOUR, DEFAULT_MINUTE, DEFAULT_PERIOD, DEFAULT_ROUTE_OPTION } from '@/constants/setup';
import type { RepeatFormData, RepeatItem } from '@/types/repeat.types';

/** 요일 라벨. 인덱스 = 0(일) ~ 6(토). */
export const DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 평일/주말 인덱스 모음. */
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND_TUE_THU = [2, 4];

/** mock 초기 데이터 (시안 28~30줄 기준). */
export const MOCK_REPEATS: RepeatItem[] = [
  {
    id: 1,
    name: '출근',
    origin: '집 (서울숲역)',
    destination: '강남역 2호선',
    days: WEEKDAYS,
    arrivalPeriod: '오전',
    arrivalHour: 9,
    arrivalMinute: 0,
    routeOption: 'subway_bus',
    enabled: true,
  },
  {
    id: 2,
    name: '헬스장',
    origin: '회사 (선릉역)',
    destination: '애니타임 피트니스',
    days: WEEKEND_TUE_THU,
    arrivalPeriod: '오후',
    arrivalHour: 7,
    arrivalMinute: 0,
    routeOption: 'subway_only',
    enabled: true,
  },
];

/** 빈 폼 default — Add 모드 초기값. */
export const EMPTY_REPEAT_FORM: RepeatFormData = {
  name: '',
  origin: '',
  destination: '',
  days: [],
  arrivalPeriod: DEFAULT_PERIOD,
  arrivalHour: DEFAULT_HOUR,
  arrivalMinute: DEFAULT_MINUTE,
  routeOption: DEFAULT_ROUTE_OPTION,
};

/** 화면 타이틀 / 모달 타이틀. */
export const SCREEN_TITLE = '반복 예약';
export const EDIT_MODAL_TITLE = '반복 예약 수정';
export const ADD_MODAL_TITLE = '새 반복 예약';

/** 추가 CTA / Empty 카피. */
export const ADD_CTA_LABEL = '추가';
export const EMPTY_TITLE = '반복 예약이 없어요';
export const EMPTY_DESCRIPTION = '자주 가는 목적지를 요일 단위로\n등록해 두면 매번 설정할 필요 없어요';
export const EMPTY_CTA_LABEL = '첫 반복 예약 만들기';

/** 폼 라벨. */
export const LABEL_NAME = '예약 이름';
export const LABEL_LOCATIONS = '출발지 / 목적지';
export const LABEL_DAYS = '반복 요일';
export const LABEL_ARRIVAL = '도착 시간';
export const LABEL_ROUTE = '경로 옵션';

/** 폼 placeholder. */
export const PLACEHOLDER_NAME = '예: 출근, 헬스장, 학원';
export const PLACEHOLDER_ORIGIN = '출발지 선택';
export const PLACEHOLDER_DESTINATION = '목적지 선택';

/** 액션 라벨. */
export const SAVE_LABEL = '저장하기';
export const DELETE_LABEL = '삭제';
export const ARRIVAL_TAP_HINT = '탭하여 변경';
