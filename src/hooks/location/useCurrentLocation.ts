import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const DEFAULT_LAT = 37.5666791;
const DEFAULT_LNG = 126.9782914;
const LOCATION_ACCURACY = Location.Accuracy.Balanced;

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
    void fetchLocation();
  }, []);

  async function fetchLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({ ...prev, isGranted: false, isLoading: false }));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: LOCATION_ACCURACY });
      setState({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        isGranted: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }

  return state;
}
