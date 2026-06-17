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
