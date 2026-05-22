import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const DEFAULT_LAT = 37.5666791;
const DEFAULT_LNG = 126.9782914;
const LOCATION_ACCURACY = Location.Accuracy.Balanced;
const WATCH_TIME_INTERVAL = 10000;
const WATCH_DISTANCE_INTERVAL = 10;

type LocationState = {
  lat: number;
  lng: number;
  isGranted: boolean;
  isLoading: boolean;
  error: Error | null;
};

/**
 * 현재 위치를 실시간으로 추적하는 훅.
 * watchPositionAsync 구독으로, 사용자가 이동하면 좌표가 갱신된다.
 * 권한 거부·측정 실패 시 서울 시청 좌표를 fallback으로 유지한다.
 */
export function useCurrentLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    isGranted: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;
    let subscription: Location.LocationSubscription | null = null;

    async function startWatching() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isActive) {
            setState(prev => ({ ...prev, isGranted: false, isLoading: false }));
          }
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: LOCATION_ACCURACY,
            timeInterval: WATCH_TIME_INTERVAL,
            distanceInterval: WATCH_DISTANCE_INTERVAL,
          },
          loc => {
            if (!isActive) return;
            setState({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              isGranted: true,
              isLoading: false,
              error: null,
            });
          },
        );

        // 구독이 완료되기 전에 언마운트된 경우 즉시 해제
        if (!isActive) {
          subscription.remove();
          subscription = null;
        }
      } catch (err) {
        if (isActive) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      }
    }

    void startWatching();

    return () => {
      isActive = false;
      subscription?.remove();
    };
  }, []);

  return state;
}
