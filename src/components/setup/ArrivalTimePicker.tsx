import { Pressable, Text, View } from 'react-native';
import { Clock, ShieldCheck } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  ARRIVAL_SECTION_TITLE,
  SAFETY_BUFFER_ACTION_LABEL,
  formatSafetyBufferText,
  type Period,
} from '@/constants/setup';
import ArrivalChipHeader, {
  type PickerMode,
} from '@/components/setup/ArrivalChipHeader';
import DateCalendarPicker from '@/components/setup/DateCalendarPicker';
import TimeWheelPicker from '@/components/setup/TimeWheelPicker';

interface Props {
  mode: PickerMode;
  onSelectMode: (mode: PickerMode) => void;

  // date 모드
  displayMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;

  // time 모드
  period: Period;
  hour: number;
  minute: number;
  onPeriodChange: (period: Period) => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;

  // date 모드 — 오늘 이전 날짜 비활성화
  minDate?: Date;

  // 칩 라벨 텍스트
  dateLabel: string;
  timeLabel: string;

  // 안전 버퍼(분) — 이 경로에만 적용되는 override 값. 사용자 default와 분리.
  safetyBufferMin: number;
  /** 안전 버퍼 박스 우측 `설정` 탭 콜백. 부모가 BottomSheet 열기를 담당. */
  onPressSafetyBuffer: () => void;
}

/**
 * Setup 화면 도착 시간 섹션 오케스트레이터.
 * - "언제 도착할까요?" 헤더 + 칩 헤더 + (date | time) 분기 + 안전 버퍼 안내 박스.
 */
export default function ArrivalTimePicker({
  mode,
  onSelectMode,
  displayMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  period,
  hour,
  minute,
  onPeriodChange,
  onHourChange,
  onMinuteChange,
  minDate,
  dateLabel,
  timeLabel,
  safetyBufferMin,
  onPressSafetyBuffer,
}: Props) {
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-300' : 'text-zinc-800';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const pickerSurface = isDark ? 'bg-zinc-900/40' : 'bg-zinc-50';
  const dividerBg = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  const bufferBoxBg = isDark ? 'bg-blue-900/30 border border-blue-800/40' : 'bg-blue-50';
  const bufferText = isDark ? 'text-blue-200' : 'text-blue-900';
  const bufferActionText = isDark ? 'text-blue-400' : 'text-blue-600';
  const shieldColor = isDark ? PALETTE.blue400 : PALETTE.blue600;

  return (
    <View className="px-5 py-6">
      <View className="mb-4 flex-row items-center gap-2">
        <Clock size={ICON_SIZE.card} color={subIconColor} />
        <Text className={`text-sm font-semibold ${labelText}`}>{ARRIVAL_SECTION_TITLE}</Text>
      </View>

      <View className={`rounded-2xl ${pickerSurface}`}>
        <ArrivalChipHeader
          mode={mode}
          onSelectMode={onSelectMode}
          dateLabel={dateLabel}
          timeLabel={timeLabel}
        />

        <View className={`mx-4 h-px ${dividerBg}`} />

        {mode === 'time' ? (
          <TimeWheelPicker
            period={period}
            hour={hour}
            minute={minute}
            onPeriodChange={onPeriodChange}
            onHourChange={onHourChange}
            onMinuteChange={onMinuteChange}
          />
        ) : (
          <DateCalendarPicker
            displayMonth={displayMonth}
            selectedDate={selectedDate}
            onSelect={onSelectDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            minDate={minDate}
          />
        )}
      </View>

      <View
        className={`mt-5 flex-row items-center justify-between rounded-xl px-4 py-3 ${bufferBoxBg}`}
      >
        <View className="flex-row items-center gap-2">
          <ShieldCheck size={ICON_SIZE.header} color={shieldColor} />
          <Text className={`text-sm font-medium ${bufferText}`}>
            {formatSafetyBufferText(safetyBufferMin)}
          </Text>
        </View>
        <Pressable
          onPress={onPressSafetyBuffer}
          accessibilityRole="button"
          accessibilityLabel="안전 버퍼 설정"
          hitSlop={6}
        >
          <Text className={`text-xs font-semibold ${bufferActionText}`}>
            {SAFETY_BUFFER_ACTION_LABEL}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
