import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const BUFFER_MIN_MINUTES = 0;
export const BUFFER_MAX_MINUTES = 30;
export const DEFAULT_BUFFER_MINUTES = 10;
export const DEFAULT_NICKNAME = '게스트';
export const NICKNAME_MAX_LENGTH = 12;

const STORAGE_KEY = 'when2go.settings';

interface SettingsState {
  bufferMinutes: number;
  nickname: string;
  setBufferMinutes: (value: number) => void;
  setNickname: (value: string) => void;
}

function clampBuffer(value: number): number {
  const rounded = Math.round(value);
  if (rounded < BUFFER_MIN_MINUTES) return BUFFER_MIN_MINUTES;
  if (rounded > BUFFER_MAX_MINUTES) return BUFFER_MAX_MINUTES;
  return rounded;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      bufferMinutes: DEFAULT_BUFFER_MINUTES,
      nickname: DEFAULT_NICKNAME,
      setBufferMinutes: (value) => {
        set({ bufferMinutes: clampBuffer(value) });
      },
      setNickname: (value) => {
        const trimmed = value.trim();
        if (trimmed.length === 0) return;
        const capped =
          trimmed.length > NICKNAME_MAX_LENGTH
            ? trimmed.slice(0, NICKNAME_MAX_LENGTH)
            : trimmed;
        set({ nickname: capped });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bufferMinutes: state.bufferMinutes,
        nickname: state.nickname,
      }),
    },
  ),
);
