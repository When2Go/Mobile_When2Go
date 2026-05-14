import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  DEFAULT_DESTINATION,
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  DEFAULT_PERIOD,
  DEFAULT_ROUTE_OPTION,
  SAFETY_BUFFER_SHEET_TITLE,
  SCREEN_TITLE,
  type Period,
  type RouteOptionId,
} from '@/constants/setup';
import { useSettingsStore } from '@/stores/settingsStore';
import DestinationHeader from '@/components/setup/DestinationHeader';
import ArrivalTimePicker from '@/components/setup/ArrivalTimePicker';
import RouteOptionList from '@/components/setup/RouteOptionList';
import DepartButton from '@/components/setup/DepartButton';
import BottomSheetModal from '@/components/common/BottomSheetModal';
import BufferSheetBody from '@/components/common/BufferSheetBody';
import type { PickerMode } from '@/components/setup/ArrivalChipHeader';

function formatDateChip(date: Date): string {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

function formatTimeChip(period: Period, hour: number, minute: number): string {
  return `${period} ${hour}:${String(minute).padStart(2, '0')}`;
}

export default function SetupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const { destination: destinationParam } = useLocalSearchParams<{ destination?: string }>();
  const destination = destinationParam?.trim() ? destinationParam.trim() : DEFAULT_DESTINATION;

  const today = useMemo(() => new Date(), []);

  const [pickerMode, setPickerMode] = useState<PickerMode>('time');
  const [displayMonth, setDisplayMonth] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [hour, setHour] = useState<number>(DEFAULT_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_MINUTE);

  const [routeType, setRouteType] = useState<RouteOptionId>(DEFAULT_ROUTE_OPTION);

  // 사용자 default 안전 버퍼(마이페이지). 이 경로에서는 store를 직접 수정하지 않고
  // local override만 둔다. 표시값 = override ?? defaultFromStore.
  const defaultBufferMin = useSettingsStore((s) => s.bufferMinutes);
  const [routeBufferOverride, setRouteBufferOverride] = useState<number | null>(null);
  const safetyBufferMin = routeBufferOverride ?? defaultBufferMin;
  const [isBufferSheetOpen, setBufferSheetOpen] = useState(false);

  const handleSaveBuffer = (next: number) => {
    setRouteBufferOverride(next);
    setBufferSheetOpen(false);
  };

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const dividerBorder = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const backBg = isDark ? 'bg-zinc-700' : 'bg-zinc-100';
  const backIconColor = isDark ? PALETTE.zinc300 : PALETTE.zinc500;

  const handlePrevMonth = () => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleChangeDestination = () => {
    router.push('/search');
  };

  const handleDepart = () => {
    // `/result` 라우트는 별도 이슈에서 추가 예정. 라우트 추가 전까지는 타입 우회.
    router.push('/result' as never);
  };

  // mock 단계에서는 destination이 비어있을 때만 비활성. 시간 기본값이 항상 세팅돼 있어 추가 검증은 X.
  const disabled = !destination;

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
        <View className={`border-b ${cardBg} ${dividerBorder}`}>
          <DestinationHeader destination={destination} onChange={handleChangeDestination} />
        </View>

        <View className={`mt-2 border-b ${cardBg} ${dividerBorder}`}>
          <ArrivalTimePicker
            mode={pickerMode}
            onSelectMode={setPickerMode}
            displayMonth={displayMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            minDate={today}
            period={period}
            hour={hour}
            minute={minute}
            onPeriodChange={setPeriod}
            onHourChange={setHour}
            onMinuteChange={setMinute}
            dateLabel={formatDateChip(selectedDate)}
            timeLabel={formatTimeChip(period, hour, minute)}
            safetyBufferMin={safetyBufferMin}
            onPressSafetyBuffer={() => setBufferSheetOpen(true)}
          />
        </View>

        <View className={`mt-2 ${cardBg}`}>
          <RouteOptionList value={routeType} onChange={setRouteType} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className={`border-t p-5 pt-3 ${cardBg} ${dividerBorder}`}>
        <DepartButton disabled={disabled} onPress={handleDepart} />
      </View>

      {isBufferSheetOpen ? (
        <BottomSheetModal
          isOpen={isBufferSheetOpen}
          onClose={() => setBufferSheetOpen(false)}
          title={SAFETY_BUFFER_SHEET_TITLE}
        >
          <BufferSheetBody
            value={safetyBufferMin}
            onSave={handleSaveBuffer}
            onCancel={() => setBufferSheetOpen(false)}
          />
        </BottomSheetModal>
      ) : null}
    </SafeAreaView>
  );
}
