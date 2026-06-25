import '../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { useDeviceStore } from '@/stores/deviceStore';
import { useRouteStore } from '@/stores/routeStore';
import { useFcmToken } from '@/hooks/common/useFcmToken';
import { useLiveActivity } from '@/hooks/widget/useLiveActivity';
import { useMobileAds } from '@/hooks/ads/useMobileAds';
import SplashView from '@/components/splash/SplashView';

export default function RootLayout() {
  // 콜드스타트 시 홈(Stack) 대신 브랜딩 스플래시를 먼저 노출한다.
  // 라우트 전환이 아닌 셸 게이트라 홈 깜빡임 없이 자연스럽게 이어진다.
  const [showSplash, setShowSplash] = useState(true);

  useFcmToken();
  useLiveActivity();
  useMobileAds();

  useEffect(() => {
    void useDeviceStore.getState().ensureDeviceId();
    useRouteStore.getState().hydrate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            {showSplash ? (
              <SplashView onFinish={() => setShowSplash(false)} />
            ) : (
              <Stack screenOptions={{ headerShown: false }} />
            )}
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
