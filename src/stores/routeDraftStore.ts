import { create } from 'zustand';

type LocationField = 'from' | 'to';

interface Coords {
  lat: number;
  lng: number;
}

interface RouteDraftState {
  pendingLocation: { location: string; field: LocationField } | null;
  fromCoords: Coords | null;
  toCoords: Coords | null;
  setPendingLocation: (location: string, field: LocationField) => void;
  consumePendingLocation: () => { location: string; field: LocationField } | null;
  setCoords: (field: LocationField, coords: Coords) => void;
}

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  pendingLocation: null,
  fromCoords: null,
  toCoords: null,
  setPendingLocation: (location, field) => set({ pendingLocation: { location, field } }),
  consumePendingLocation: () => {
    const current = get().pendingLocation;
    set({ pendingLocation: null });
    return current;
  },
  setCoords: (field, coords) =>
    set(field === 'from' ? { fromCoords: coords } : { toCoords: coords }),
}));
