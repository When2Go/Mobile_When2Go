jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
    clear: jest.fn(async () => {}),
  },
}));

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { useReservationToggleStore } from '../reservationToggleStore';

beforeEach(() => {
  useReservationToggleStore.setState({ disabledIds: [] });
});

describe('reservationToggleStore — 초기 상태', () => {
  test('disabledIds 초기값은 빈 배열이다', () => {
    expect(useReservationToggleStore.getState().disabledIds).toEqual([]);
  });
});

describe('reservationToggleStore — disable', () => {
  test('disable(id) 호출 시 disabledIds에 id가 추가된다', () => {
    useReservationToggleStore.getState().disable(10);
    expect(useReservationToggleStore.getState().disabledIds).toContain(10);
  });

  test('이미 비활성인 id를 disable해도 중복 추가되지 않는다', () => {
    useReservationToggleStore.getState().disable(10);
    useReservationToggleStore.getState().disable(10);
    const ids = useReservationToggleStore.getState().disabledIds;
    expect(ids.filter((id) => id === 10)).toHaveLength(1);
  });

  test('여러 id를 disable하면 모두 disabledIds에 포함된다', () => {
    useReservationToggleStore.getState().disable(1);
    useReservationToggleStore.getState().disable(2);
    const ids = useReservationToggleStore.getState().disabledIds;
    expect(ids).toContain(1);
    expect(ids).toContain(2);
  });
});

describe('reservationToggleStore — enable', () => {
  test('enable(id) 호출 시 disabledIds에서 id가 제거된다', () => {
    useReservationToggleStore.setState({ disabledIds: [10, 20] });
    useReservationToggleStore.getState().enable(10);
    expect(useReservationToggleStore.getState().disabledIds).not.toContain(10);
  });

  test('enable 후 다른 id는 그대로 남는다', () => {
    useReservationToggleStore.setState({ disabledIds: [10, 20] });
    useReservationToggleStore.getState().enable(10);
    expect(useReservationToggleStore.getState().disabledIds).toContain(20);
  });

  test('활성 상태인 id를 enable해도 에러 없이 동작한다', () => {
    expect(() => useReservationToggleStore.getState().enable(99)).not.toThrow();
    expect(useReservationToggleStore.getState().disabledIds).not.toContain(99);
  });
});

describe('reservationToggleStore — remove', () => {
  test('remove(id) 호출 시 disabledIds에서 id가 제거된다', () => {
    useReservationToggleStore.setState({ disabledIds: [10] });
    useReservationToggleStore.getState().remove(10);
    expect(useReservationToggleStore.getState().disabledIds).not.toContain(10);
  });

  test('remove 후 다른 id는 그대로 남는다', () => {
    useReservationToggleStore.setState({ disabledIds: [10, 20] });
    useReservationToggleStore.getState().remove(10);
    expect(useReservationToggleStore.getState().disabledIds).toContain(20);
  });

  test('disabledIds에 없는 id를 remove해도 에러 없이 동작한다', () => {
    expect(() => useReservationToggleStore.getState().remove(99)).not.toThrow();
  });
});

describe('reservationToggleStore — toggle 시나리오', () => {
  test('disable → enable 순서로 호출하면 최종 disabledIds에 포함되지 않는다', () => {
    useReservationToggleStore.getState().disable(5);
    useReservationToggleStore.getState().enable(5);
    expect(useReservationToggleStore.getState().disabledIds).not.toContain(5);
  });

  test('enable → disable 순서로 호출하면 최종 disabledIds에 포함된다', () => {
    useReservationToggleStore.getState().enable(5);
    useReservationToggleStore.getState().disable(5);
    expect(useReservationToggleStore.getState().disabledIds).toContain(5);
  });
});
