import { create } from 'zustand';

import type { RepeatItem } from '@/types/repeat.types';

interface ReservationState {
  items: RepeatItem[];
  setItems: (items: RepeatItem[]) => void;
}

export const useReservationStore = create<ReservationState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
