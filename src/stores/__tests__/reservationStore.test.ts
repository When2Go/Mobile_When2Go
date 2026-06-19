import type { RepeatItem } from '@/types/repeat.types';
import { useReservationStore } from '../reservationStore';

const ITEM_A: RepeatItem = {
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
};

const ITEM_B: RepeatItem = {
  id: 2,
  name: '퇴근',
  origin: '회사',
  destination: '집',
  days: [1, 2, 3, 4, 5],
  arrivalPeriod: '오후',
  arrivalHour: 7,
  arrivalMinute: 0,
  routeOption: 'subway_bus',
  enabled: true,
};

beforeEach(() => {
  useReservationStore.setState({ items: [] });
});

describe('reservationStore — 초기 상태', () => {
  test('items 초기값은 빈 배열이다', () => {
    expect(useReservationStore.getState().items).toEqual([]);
  });
});

describe('reservationStore — setItems', () => {
  test('setItems([A, B]) 이후 items 길이가 2이다', () => {
    useReservationStore.getState().setItems([ITEM_A, ITEM_B]);
    expect(useReservationStore.getState().items).toHaveLength(2);
  });

  test('setItems로 전달된 배열을 그대로 저장한다', () => {
    useReservationStore.getState().setItems([ITEM_A]);
    expect(useReservationStore.getState().items[0]).toEqual(ITEM_A);
  });

  test('setItems([]) 호출 시 빈 배열로 덮어쓴다', () => {
    useReservationStore.getState().setItems([ITEM_A, ITEM_B]);
    useReservationStore.getState().setItems([]);
    expect(useReservationStore.getState().items).toEqual([]);
  });

  test('setItems 재호출 시 이전 items를 완전히 교체한다', () => {
    useReservationStore.getState().setItems([ITEM_A]);
    useReservationStore.getState().setItems([ITEM_B]);
    expect(useReservationStore.getState().items).toEqual([ITEM_B]);
  });
});
