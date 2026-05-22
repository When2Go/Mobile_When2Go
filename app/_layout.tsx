import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KakaoMap } from '@react-native-kakao/map';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { useDeviceStore } from '@/stores/deviceStore';

const KAKAO_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '';

export default function RootLayout() {
  useEffect(() => {
    void useDeviceStore.getState().ensureDeviceId();

    if (!KAKAO_APP_KEY) {
      console.warn('[KakaoMap] EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY가 설정되지 않았습니다.');
      return;
    }
    KakaoMap.initializeKakaoMapSDK(KAKAO_APP_KEY).catch(e => {
      console.error('[KakaoMap] SDK 초기화 실패:', e);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
