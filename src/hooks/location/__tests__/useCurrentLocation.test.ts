jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useCurrentLocation } from '../useCurrentLocation';

const mockRequestPermissions =
  Location.requestForegroundPermissionsAsync as jest.MockedFunction<
    typeof Location.requestForegroundPermissionsAsync
  >;
const mockWatchPosition =
  Location.watchPositionAsync as jest.MockedFunction<
    typeof Location.watchPositionAsync
  >;

const SEOUL_CITY_HALL = { lat: 37.5666791, lng: 126.9782914 };

type WatchCallback = Parameters<typeof Location.watchPositionAsync>[1];

/** watchPositionAsync mock 설정 — 구독 콜백을 캡처해 테스트에서 위치 이벤트를 흘려보낸다. */
function mockWatch(remove: () => void = jest.fn()) {
  let callback: WatchCallback | undefined;
  mockWatchPosition.mockImplementation((_options, cb) => {
    callback = cb;
    return Promise.resolve({ remove } as Location.LocationSubscription);
  });
  return {
    /** 위치 업데이트 이벤트 1회 발생 */
    emit(latitude: number, longitude: number) {
      act(() => {
        callback?.({ coords: { latitude, longitude } } as never);
      });
    },
  };
}

describe('useCurrentLocation', () => {
  beforeEach(() => {
    mockRequestPermissions.mockReset();
    mockWatchPosition.mockReset();
  });

  // 정상: 권한 허용 + 위치 이벤트 수신
  test('권한 허용 후 위치 이벤트를 받으면 좌표를 반환하고 isGranted가 true다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    const watch = mockWatch();

    const { result } = renderHook(() => useCurrentLocation());
    await waitFor(() => expect(mockWatchPosition).toHaveBeenCalled());

    watch.emit(37.5, 127.0);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lat).toBe(37.5);
    expect(result.current.lng).toBe(127.0);
    expect(result.current.isGranted).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // 실시간 추적: 위치 이벤트가 여러 번 오면 최신 좌표로 갱신한다
  test('위치가 변하면 새 좌표로 갱신한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    const watch = mockWatch();

    const { result } = renderHook(() => useCurrentLocation());
    await waitFor(() => expect(mockWatchPosition).toHaveBeenCalled());

    watch.emit(37.5, 127.0);
    await waitFor(() => expect(result.current.lat).toBe(37.5));

    watch.emit(35.1, 129.0);
    await waitFor(() => expect(result.current.lat).toBe(35.1));
    expect(result.current.lng).toBe(129.0);
  });

  // 경계값: 좌표 (0, 0) — 위도·경도가 모두 0인 유효 좌표
  test('위도·경도가 0인 좌표도 정상 처리한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    const watch = mockWatch();

    const { result } = renderHook(() => useCurrentLocation());
    await waitFor(() => expect(mockWatchPosition).toHaveBeenCalled());

    watch.emit(0, 0);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lat).toBe(0);
    expect(result.current.lng).toBe(0);
    expect(result.current.isGranted).toBe(true);
  });

  // 분기: 권한 거부 → 서울 시청 기본 좌표 fallback
  test('권한 거부 시 서울 시청 기본 좌표를 반환하고 isGranted가 false다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' } as never);

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lat).toBeCloseTo(SEOUL_CITY_HALL.lat);
    expect(result.current.lng).toBeCloseTo(SEOUL_CITY_HALL.lng);
    expect(result.current.isGranted).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockWatchPosition).not.toHaveBeenCalled();
  });

  // 에러: watchPositionAsync 실패 → error 상태 + 기본 좌표 유지
  test('위치 구독 실패 시 error 상태가 설정되고 기본 좌표를 유지한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockWatchPosition.mockRejectedValue(new Error('GPS unavailable'));

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('GPS unavailable');
    expect(result.current.lat).toBeCloseTo(SEOUL_CITY_HALL.lat);
    expect(result.current.isGranted).toBe(false);
  });

  // 정리: 언마운트 시 위치 구독을 해제한다
  test('언마운트 시 위치 구독을 해제한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    const remove = jest.fn();
    mockWatch(remove);

    const { unmount } = renderHook(() => useCurrentLocation());
    await waitFor(() => expect(mockWatchPosition).toHaveBeenCalled());

    unmount();
    expect(remove).toHaveBeenCalled();
  });

  // 초기 상태: resolve 전 isLoading = true
  test('초기 로딩 상태에서 isLoading이 true이고 기본 좌표를 가진다', () => {
    mockRequestPermissions.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lat).toBeCloseTo(SEOUL_CITY_HALL.lat);
    expect(result.current.lng).toBeCloseTo(SEOUL_CITY_HALL.lng);
  });
});
