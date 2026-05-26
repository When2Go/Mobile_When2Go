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

function mockWatch(remove: () => void = jest.fn()) {
  let callback: WatchCallback | undefined;
  mockWatchPosition.mockImplementation((_options, cb) => {
    callback = cb;
    return Promise.resolve({ remove } as Location.LocationSubscription);
  });
  return {
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

  test('언마운트 시 위치 구독을 해제한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    const remove = jest.fn();
    mockWatch(remove);

    const { unmount } = renderHook(() => useCurrentLocation());
    await waitFor(() => expect(mockWatchPosition).toHaveBeenCalled());

    unmount();
    expect(remove).toHaveBeenCalled();
  });

  test('초기 로딩 상태에서 isLoading이 true이고 기본 좌표를 가진다', () => {
    mockRequestPermissions.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lat).toBeCloseTo(SEOUL_CITY_HALL.lat);
    expect(result.current.lng).toBeCloseTo(SEOUL_CITY_HALL.lng);
  });
});
