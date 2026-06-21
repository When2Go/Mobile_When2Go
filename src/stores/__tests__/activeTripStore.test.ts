import { useActiveTripStore } from '../activeTripStore';

const POLYLINE_A = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
const BOARDING_COORD = { latitude: 37.4565, longitude: 126.7052 };

describe('activeTripStore', () => {
  beforeEach(() => {
    useActiveTripStore.setState({
      activeTripPolyline: null,
      activeTripBoardingCoord: null,
      isActiveTrip: false,
      hasDeparted: false,
    });
  });

  describe('setActiveTrip', () => {
    test('① polyline과 boardingCoord를 저장하고 isActiveTrip을 true로 설정한다', () => {
      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, BOARDING_COORD);

      const s = useActiveTripStore.getState();
      expect(s.activeTripPolyline).toBe(POLYLINE_A);
      expect(s.activeTripBoardingCoord).toEqual(BOARDING_COORD);
      expect(s.isActiveTrip).toBe(true);
    });

    test('② boardingCoord가 null이어도 정상 저장된다', () => {
      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, null);

      const s = useActiveTripStore.getState();
      expect(s.activeTripPolyline).toBe(POLYLINE_A);
      expect(s.activeTripBoardingCoord).toBeNull();
      expect(s.isActiveTrip).toBe(true);
    });

    test('③ hasDeparted가 이미 true일 때 재출발하면 false로 초기화된다', () => {
      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, BOARDING_COORD);
      useActiveTripStore.getState().confirmDeparture();
      expect(useActiveTripStore.getState().hasDeparted).toBe(true);

      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, null);

      expect(useActiveTripStore.getState().hasDeparted).toBe(false);
    });
  });

  describe('clearActiveTrip', () => {
    test('④ 모든 필드를 초기값으로 리셋한다', () => {
      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, BOARDING_COORD);
      useActiveTripStore.getState().clearActiveTrip();

      const s = useActiveTripStore.getState();
      expect(s.activeTripPolyline).toBeNull();
      expect(s.activeTripBoardingCoord).toBeNull();
      expect(s.isActiveTrip).toBe(false);
      expect(s.hasDeparted).toBe(false);
    });
  });

  describe('confirmDeparture', () => {
    test('⑤ hasDeparted를 true로 설정하고 나머지 필드는 유지한다', () => {
      useActiveTripStore.getState().setActiveTrip(POLYLINE_A, BOARDING_COORD);
      useActiveTripStore.getState().confirmDeparture();

      const s = useActiveTripStore.getState();
      expect(s.hasDeparted).toBe(true);
      expect(s.isActiveTrip).toBe(true);
      expect(s.activeTripPolyline).toBe(POLYLINE_A);
    });
  });
});
