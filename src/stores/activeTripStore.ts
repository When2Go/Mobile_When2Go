import { create } from 'zustand';

import type { LatLng } from '@/api/route/types';

interface ActiveTripState {
  activeTripPolyline: string | null;
  activeTripBoardingCoord: LatLng | null;
  isActiveTrip: boolean;
  hasDeparted: boolean;
  setActiveTrip: (polyline: string, boardingCoord: LatLng | null) => void;
  clearActiveTrip: () => void;
  confirmDeparture: () => void;
}

export const useActiveTripStore = create<ActiveTripState>()((set) => ({
  activeTripPolyline: null,
  activeTripBoardingCoord: null,
  isActiveTrip: false,
  hasDeparted: false,
  setActiveTrip: (polyline, boardingCoord) =>
    set({ activeTripPolyline: polyline, activeTripBoardingCoord: boardingCoord, isActiveTrip: true, hasDeparted: false }),
  clearActiveTrip: () =>
    set({ activeTripPolyline: null, activeTripBoardingCoord: null, isActiveTrip: false, hasDeparted: false }),
  confirmDeparture: () => set({ hasDeparted: true }),
}));
