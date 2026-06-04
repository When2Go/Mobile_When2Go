import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { RouteSearchRequest } from '@/api/route/types';
import type { ApiFailure } from '@/types/api.types';
import { useRouteSearch } from '../useRouteSearch';

jest.mock('@/api/route', () => ({
  searchRoutes: jest.fn(),
}));

const { searchRoutes } = jest.requireMock('@/api/route') as {
  searchRoutes: jest.MockedFunction<(req: RouteSearchRequest) => Promise<unknown>>;
};

const MOCK_ROUTE = {
  distanceMeters: 5209,
  duration: '1438s',
  staticDuration: '1438s',
  legs: [
    {
      steps: [
        {
          travelMode: 'TRANSIT' as const,
          distanceMeters: 4997,
          staticDuration: '924s',
          transitDetails: {
            stopDetails: {
              departureStop: { name: '주안역' },
              arrivalStop: { name: '인하대역' },
              departureTime: '2026-05-22T04:13:11Z',
              arrivalTime: '2026-05-22T04:28:35Z',
            },
            transitLine: { vehicle: { type: 'BUS' } },
          },
        },
      ],
    },
  ],
  routeLabels: ['DEFAULT_ROUTE'],
  localizedValues: { duration: { text: '24분' } },
};

const VALID_REQ: RouteSearchRequest = {
  originLat: 37.465,
  originLng: 126.679,
  destLat: 37.448,
  destLng: 126.649,
  arrivalTime: '14:30',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useRouteSearch', () => {
  // 정상
  it('유효한 req 제공 시 API를 호출하고 routes를 반환한다', async () => {
    searchRoutes.mockResolvedValue([MOCK_ROUTE]);

    const { result } = renderHook(() => useRouteSearch(VALID_REQ));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(searchRoutes).toHaveBeenCalledWith(VALID_REQ);
    expect(result.current.routes).toHaveLength(1);
    expect(result.current.routes[0].badge).toBe('optimal');
    expect(result.current.error).toBeNull();
  });

  // 경계: 빈 routes 배열
  it('API가 빈 배열을 반환하면 routes가 빈 배열이다', async () => {
    searchRoutes.mockResolvedValue([]);

    const { result } = renderHook(() => useRouteSearch(VALID_REQ));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.routes).toEqual([]);
  });

  // 분기: req가 null이면 API 미호출
  it('req가 null이면 API를 호출하지 않고 isLoading false를 유지한다', () => {
    const { result } = renderHook(() => useRouteSearch(null));

    expect(searchRoutes).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.routes).toEqual([]);
  });

  // 에러
  it('API 실패 시 error 상태를 설정한다', async () => {
    const failure: ApiFailure = { ok: false, reason: 'SERVER', status: 500 };
    searchRoutes.mockRejectedValue(failure);

    const { result } = renderHook(() => useRouteSearch(VALID_REQ));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(failure);
    expect(result.current.routes).toEqual([]);
  });

  // req 변경 시 재조회
  it('req가 변경되면 API를 다시 호출한다', async () => {
    searchRoutes.mockResolvedValue([MOCK_ROUTE]);

    const { result, rerender } = renderHook(
      ({ req }: { req: RouteSearchRequest | null }) => useRouteSearch(req),
      { initialProps: { req: VALID_REQ } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const changedReq = { ...VALID_REQ, arrivalTime: '15:00' };
    act(() => {
      rerender({ req: changedReq });
    });

    await waitFor(() => {
      expect(searchRoutes).toHaveBeenCalledTimes(2);
    });
  });
});
