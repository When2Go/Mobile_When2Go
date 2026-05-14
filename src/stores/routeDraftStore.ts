import { create } from 'zustand';

type LocationField = 'from' | 'to';

interface RouteDraftState {
  pendingLocation: { location: string; field: LocationField } | null;
  setPendingLocation: (location: string, field: LocationField) => void;
  consumePendingLocation: () => { location: string; field: LocationField } | null;
}

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  pendingLocation: null,
  setPendingLocation: (location, field) => set({ pendingLocation: { location, field } }),
  consumePendingLocation: () => {
    const current = get().pendingLocation;
    set({ pendingLocation: null });
    return current;
  },
}));
