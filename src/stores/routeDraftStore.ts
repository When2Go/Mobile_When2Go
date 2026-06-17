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
  /** 도착지 표시명. Trip 생성 시 destName으로 전달. */
  toName: string | null;
  setPendingLocation: (location: string, field: LocationField) => void;
  consumePendingLocation: () => { location: string; field: LocationField } | null;
  setCoords: (field: LocationField, coords: Coords) => void;
  setToName: (name: string) => void;
}

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  pendingLocation: null,
  fromCoords: null,
  toCoords: null,
  toName: null,
  setPendingLocation: (location, field) => set({ pendingLocation: { location, field } }),
  consumePendingLocation: () => {
    const current = get().pendingLocation;
    set({ pendingLocation: null });
    return current;
  },
  setCoords: (field, coords) =>
    set(field === 'from' ? { fromCoords: coords } : { toCoords: coords }),
  setToName: (name) => set({ toName: name }),
}));
