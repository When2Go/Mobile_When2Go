jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useCurrentLocation } from '../useCurrentLocation';

const mockRequestPermissions =
  Location.requestForegroundPermissionsAsync as jest.MockedFunction<
    typeof Location.requestForegroundPermissionsAsync
  >;
const mockGetPosition =
  Location.getCurrentPositionAsync as jest.MockedFunction<
    typeof Location.getCurrentPositionAsync
  >;

const SEOUL_CITY_HALL = { lat: 37.5666791, lng: 126.9782914 };

describe('useCurrentLocation', () => {
  beforeEach(() => {
    mockRequestPermissions.mockReset();
    mockGetPosition.mockReset();
  });

  // 정상: 권한 허용 + 좌표 획득 성공
  test('권한 허용 시 현재 좌표를 반환하고 isGranted가 true다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockGetPosition.mockResolvedValue({
      coords: { latitude: 37.5, longitude: 127.0 },
    } as never);

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lat).toBe(37.5);
    expect(result.current.lng).toBe(127.0);
    expect(result.current.isGranted).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // 경계값: 좌표 (0, 0) — 경도·위도가 모두 0인 유효 좌표
  test('위도·경도가 0인 좌표도 정상 처리한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockGetPosition.mockResolvedValue({
      coords: { latitude: 0, longitude: 0 },
    } as never);

    const { result } = renderHook(() => useCurrentLocation());

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
  });

  // 에러: getCurrentPositionAsync 실패 → error 상태 + 기본 좌표 유지
  test('좌표 획득 실패 시 error 상태가 설정되고 기본 좌표를 유지한다', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockGetPosition.mockRejectedValue(new Error('GPS unavailable'));

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('GPS unavailable');
    expect(result.current.lat).toBeCloseTo(SEOUL_CITY_HALL.lat);
    expect(result.current.isGranted).toBe(false);
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
