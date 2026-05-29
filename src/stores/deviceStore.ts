import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORAGE_KEY = 'when2go.device';

interface DeviceState {
  // 앱 인스톨 단위 고유 식별자. 앱 삭제 전까지 동일. MAC 주소는 iOS/Android 모두
  // 일반 앱이 접근 불가하므로, 첫 실행 시 UUID v4를 생성해 AsyncStorage에 영속화한다.
  deviceId: string | null;
  // 마지막으로 백엔드에 등록 성공한 FCM 토큰. 동일 토큰 재등록을 피하기 위한 캐시.
  lastFcmToken: string | null;
  ensureDeviceId: () => Promise<string>;
  setLastFcmToken: (token: string) => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      deviceId: null,
      lastFcmToken: null,
      ensureDeviceId: async () => {
        const current = get().deviceId;
        if (current) return current;
        const generated = randomUUID();
        set({ deviceId: generated });
        return generated;
      },
      setLastFcmToken: (token) => set({ lastFcmToken: token }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deviceId: state.deviceId,
        lastFcmToken: state.lastFcmToken,
      }),
    },
  ),
);
