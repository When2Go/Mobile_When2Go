import { useRouteDraftStore } from '../routeDraftStore';

describe('routeDraftStore', () => {
  beforeEach(() => {
    useRouteDraftStore.setState({ pendingLocation: null });
  });

  test('① 설정 후 소비하면 저장된 값을 반환하고 상태가 null이 된다', () => {
    useRouteDraftStore.getState().setPendingLocation('강남역', 'to');

    const result = useRouteDraftStore.getState().consumePendingLocation();

    expect(result).toEqual({ location: '강남역', field: 'to' });
    expect(useRouteDraftStore.getState().pendingLocation).toBeNull();
  });

  test('② pending이 없을 때 소비하면 null을 반환한다', () => {
    const result = useRouteDraftStore.getState().consumePendingLocation();

    expect(result).toBeNull();
  });

  test('③ 두 번째 consume은 항상 null을 반환한다 (1회 소비 보장)', () => {
    useRouteDraftStore.getState().setPendingLocation('인하대 정문', 'from');
    useRouteDraftStore.getState().consumePendingLocation();

    const second = useRouteDraftStore.getState().consumePendingLocation();

    expect(second).toBeNull();
  });

  test('④ field가 "from"일 때도 올바르게 저장·반환된다', () => {
    useRouteDraftStore.getState().setPendingLocation('인하대 정문', 'from');

    const result = useRouteDraftStore.getState().consumePendingLocation();

    expect(result).toEqual({ location: '인하대 정문', field: 'from' });
  });
});
