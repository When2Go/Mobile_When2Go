import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ARRIVAL_LABEL } from '@/constants/setup';

export type PickerMode = 'date' | 'time';

interface Props {
  mode: PickerMode;
  onSelectMode: (mode: PickerMode) => void;
  dateLabel: string;
  timeLabel: string;
}

/**
 * "도착" 라벨 + 날짜 / 시간 토글 칩.
 * - 활성 칩은 primary blue 글자.
 */
export default function ArrivalChipHeader({
  mode,
  onSelectMode,
  dateLabel,
  timeLabel,
}: Props) {
  const { isDark } = useTheme();

  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const chipBg = isDark ? 'bg-zinc-700/80' : 'bg-zinc-200/80';
  const activeText = isDark ? 'text-blue-400' : 'text-blue-600';
  const inactiveText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  const renderChip = (target: PickerMode, label: string) => {
    const isActive = mode === target;
    return (
      <Pressable
        onPress={() => onSelectMode(target)}
        accessibilityRole="button"
        accessibilityLabel={`${target === 'date' ? '날짜' : '시간'} 모드`}
        hitSlop={6}
        className={`rounded-lg px-3 py-1.5 active:opacity-70 ${chipBg}`}
      >
        <Text className={`text-sm font-semibold ${isActive ? activeText : inactiveText}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className={`text-base font-semibold ${headingText}`}>{ARRIVAL_LABEL}</Text>
      <View className="flex-row gap-2">
        {renderChip('date', dateLabel)}
        {renderChip('time', timeLabel)}
      </View>
    </View>
  );
}
