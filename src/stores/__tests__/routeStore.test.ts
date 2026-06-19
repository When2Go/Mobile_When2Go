jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { waitFor } from '@testing-library/react-native';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useRouteStore } from '@/stores/routeStore';
import type { RouteFormData } from '@/types/routes.types';

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

const makeForm = (overrides: Partial<RouteFormData> = {}): RouteFormData => ({
  name: '출근',
  from: '인하대 정문',
  to: '강남역 2호선',
  frequency: '주 5회 이용',
  ...overrides,
});

const lastSavedPayload = () => {
  const calls = mockSetItem.mock.calls;
  return JSON.parse(calls[calls.length - 1][1] as string) as {
    routes: unknown[];
    _seq: number;
  };
};

describe('routeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    useRouteStore.setState({ routes: [], _seq: 0, _isHydrated: false });
  });

  // ─── 정상 ──────────────────────────────────────────────────────────────────
  it('addRoute: 폼을 받아 새 경로를 추가한다', () => {
    useRouteStore.getState().addRoute(makeForm());

    const { routes } = useRouteStore.getState();
    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatchObject({ name: '출근', from: '인하대 정문', to: '강남역 2호선' });
    expect(routes[0].id).toBeTruthy();
  });

  it('updateRoute: 같은 id의 경로 내용을 교체하되 id는 유지한다', () => {
    useRouteStore.getState().addRoute(makeForm());
    const { id } = useRouteStore.getState().routes[0];

    useRouteStore.getState().updateRoute(id, makeForm({ name: '퇴근', frequency: '주 4회 이용' }));

    const { routes } = useRouteStore.getState();
    expect(routes).toHaveLength(1);
    expect(routes[0].id).toBe(id);
    expect(routes[0].name).toBe('퇴근');
    expect(routes[0].frequency).toBe('주 4회 이용');
  });

  it('removeRoute: id로 경로를 삭제한다', () => {
    useRouteStore.getState().addRoute(makeForm({ name: 'A' }));
    useRouteStore.getState().addRoute(makeForm({ name: 'B' }));
    const targetId = useRouteStore.getState().routes[0].id;

    useRouteStore.getState().removeRoute(targetId);

    const { routes } = useRouteStore.getState();
    expect(routes).toHaveLength(1);
    expect(routes[0].name).toBe('B');
  });

  it('모든 변경은 AsyncStorage에 { routes, _seq } 형태로 저장한다', () => {
    useRouteStore.getState().addRoute(makeForm());

    expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.ROUTES, expect.any(String));
    const payload = lastSavedPayload();
    expect(payload.routes).toHaveLength(1);
    expect(payload._seq).toBeGreaterThan(0);
  });

  // ─── 경계 ──────────────────────────────────────────────────────────────────
  it('빈 목록에서 removeRoute 해도 안전하다', () => {
    expect(() => useRouteStore.getState().removeRoute('none')).not.toThrow();
    expect(useRouteStore.getState().routes).toHaveLength(0);
  });

  it('id는 단조 증가한다 — 삭제 후 추가해도 이전 id를 재사용하지 않는다', () => {
    useRouteStore.getState().addRoute(makeForm({ name: 'A' }));
    const firstId = useRouteStore.getState().routes[0].id;
    useRouteStore.getState().removeRoute(firstId);
    useRouteStore.getState().addRoute(makeForm({ name: 'B' }));

    const secondId = useRouteStore.getState().routes[0].id;
    expect(secondId).not.toBe(firstId);
  });

  // ─── 분기 ──────────────────────────────────────────────────────────────────
  it('좌표가 있으면 그대로 보존한다', () => {
    useRouteStore.getState().addRoute(
      makeForm({
        fromCoords: { lat: 37.45, lng: 126.65 },
        toCoords: { lat: 37.49, lng: 127.02 },
      }),
    );

    const { routes } = useRouteStore.getState();
    expect(routes[0].fromCoords).toEqual({ lat: 37.45, lng: 126.65 });
    expect(routes[0].toCoords).toEqual({ lat: 37.49, lng: 127.02 });
  });

  it('좌표가 없으면 좌표 필드 없이 저장한다', () => {
    useRouteStore.getState().addRoute(makeForm());

    const { routes } = useRouteStore.getState();
    expect(routes[0].fromCoords).toBeUndefined();
    expect(routes[0].toCoords).toBeUndefined();
  });

  // ─── 에러/복원 ─────────────────────────────────────────────────────────────
  it('hydrate: 저장된 값이 있으면 routes와 _seq를 복원한다', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({
        routes: [{ id: 'route-3', name: '병원', from: '집', to: '서울대병원', frequency: '월 1회' }],
        _seq: 3,
      }),
    );

    useRouteStore.getState().hydrate();

    await waitFor(() => {
      expect(useRouteStore.getState().routes).toHaveLength(1);
    });
    expect(useRouteStore.getState().routes[0].name).toBe('병원');
    expect(useRouteStore.getState()._seq).toBe(3);
  });

  it('hydrate: 저장된 값이 없으면 빈 목록을 유지한다', async () => {
    mockGetItem.mockResolvedValue(null);

    useRouteStore.getState().hydrate();

    await waitFor(() => {
      expect(useRouteStore.getState()._isHydrated).toBe(true);
    });
    expect(useRouteStore.getState().routes).toHaveLength(0);
  });

  it('hydrate: 깨진 JSON이면 빈 목록을 유지하고 throw 하지 않는다', async () => {
    mockGetItem.mockResolvedValue('{ broken json');

    expect(() => useRouteStore.getState().hydrate()).not.toThrow();

    await waitFor(() => {
      expect(useRouteStore.getState()._isHydrated).toBe(true);
    });
    expect(useRouteStore.getState().routes).toHaveLength(0);
  });

  it('hydrate: 이미 hydrate 됐으면 중복 로드하지 않는다', () => {
    useRouteStore.setState({ _isHydrated: true });
    useRouteStore.getState().hydrate();
    expect(mockGetItem).not.toHaveBeenCalled();
  });
});
