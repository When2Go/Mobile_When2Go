import { create } from 'zustand';

import type { Coords } from '@/types/routes.types';

type LocationField = 'from' | 'to';

interface RouteDraftState {
  pendingLocation: { location: string; field: LocationField } | null;
  fromCoords: Coords | null;
  toCoords: Coords | null;
  /** 도착지 표시명. Trip 생성 시 destName으로 전달. */
  toName: string | null;
  /** 선택 경로의 Route 레벨 encodedPolyline. MapPreview 폴리라인 렌더용. */
  selectedPolyline: string | null;
  setPendingLocation: (location: string, field: LocationField) => void;
  consumePendingLocation: () => { location: string; field: LocationField } | null;
  setCoords: (field: LocationField, coords: Coords) => void;
  setToName: (name: string) => void;
  setSelectedPolyline: (encoded: string | null) => void;
}

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  pendingLocation: null,
  fromCoords: null,
  toCoords: null,
  toName: null,
  selectedPolyline: null,
  setPendingLocation: (location, field) => set({ pendingLocation: { location, field } }),
  consumePendingLocation: () => {
    const current = get().pendingLocation;
    set({ pendingLocation: null });
    return current;
  },
  setCoords: (field, coords) =>
    set(field === 'from' ? { fromCoords: coords } : { toCoords: coords }),
  setToName: (name) => set({ toName: name }),
  setSelectedPolyline: (encoded) => set({ selectedPolyline: encoded }),
}));
