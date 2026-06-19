import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storageKeys';

interface ReservationToggleState {
  disabledIds: number[];
  disable: (reservationId: number) => void;
  enable: (reservationId: number) => void;
  remove: (reservationId: number) => void;
}

export const useReservationToggleStore = create<ReservationToggleState>()(
  persist(
    (set) => ({
      disabledIds: [],
      disable: (reservationId) =>
        set((state) => ({
          disabledIds: state.disabledIds.includes(reservationId)
            ? state.disabledIds
            : [...state.disabledIds, reservationId],
        })),
      enable: (reservationId) =>
        set((state) => ({
          disabledIds: state.disabledIds.filter((id) => id !== reservationId),
        })),
      remove: (reservationId) =>
        set((state) => ({
          disabledIds: state.disabledIds.filter((id) => id !== reservationId),
        })),
    }),
    {
      name: STORAGE_KEYS.RESERVATION_TOGGLE,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
