import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  ARRIVAL_TARGET_PREFIX,
  CONFIRM_REDIRECT_DELAY_MS,
  MOCK_ROUTES,
  SCREEN_TITLE,
  SELECT_ROUTE_HEADING,
  type MockRoute,
} from '@/constants/result';
import { useSettingsStore } from '@/stores/settingsStore';
import AdSlot from '@/components/common/AdSlot';
import DepartureTimeHeader from '@/components/result/DepartureTimeHeader';
import RouteCard from '@/components/result/RouteCard';
import ReservationCompleteModal from '@/components/result/ReservationCompleteModal';

const SCHEDULE_PATH = '/schedule';

export default function ResultScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const safetyBufferMin = useSettingsStore((s) => s.bufferMinutes);

  const [selectedRoute, setSelectedRoute] = useState<MockRoute | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const dividerBorder = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const backBg = isDark ? 'bg-zinc-700' : 'bg-zinc-100';
  const backIconColor = isDark ? PALETTE.zinc300 : PALETTE.zinc500;

  const handleSelectRoute = (route: MockRoute) => {
    setSelectedRoute(route);
    setConfirmed(false);
  };

  const handleCloseModal = () => {
    if (confirmed) return;
    setSelectedRoute(null);
  };

  const handleConfirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    redirectTimerRef.current = setTimeout(() => {
      setSelectedRoute(null);
      setConfirmed(false);
      router.push(SCHEDULE_PATH);
    }, CONFIRM_REDIRECT_DELAY_MS);
  };

  return (
    <SafeAreaView className={`flex-1 ${pageBg}`} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View
        className={`flex-row items-center gap-3 border-b px-5 py-4 ${cardBg} ${dividerBorder}`}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
          className={`h-9 w-9 items-center justify-center rounded-full active:opacity-70 ${backBg}`}
        >
          <ArrowLeft size={ICON_SIZE.header} color={backIconColor} />
        </Pressable>
        <Text className={`text-lg font-bold ${headingText}`}>{SCREEN_TITLE}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <DepartureTimeHeader
          targetPrefix={ARRIVAL_TARGET_PREFIX}
          heading={SELECT_ROUTE_HEADING}
          safetyBufferMin={safetyBufferMin}
        />

        <View className="gap-3 px-5">
          {MOCK_ROUTES.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onPress={() => handleSelectRoute(route)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Ad Slot */}
      <View className={`border-t p-4 ${cardBg} ${dividerBorder}`}>
        <AdSlot type="banner" />
      </View>

      {selectedRoute ? (
        <ReservationCompleteModal
          isOpen={selectedRoute !== null}
          route={selectedRoute}
          confirmed={confirmed}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />
      ) : null}
    </SafeAreaView>
  );
}
