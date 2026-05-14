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
  // 활성/비활성 배경 분리 — 시각 구분 강화 (#33 WARNING 1)
  const activeChipBg = isDark ? 'bg-zinc-600' : 'bg-white';
  const inactiveChipBg = isDark ? 'bg-zinc-700/80' : 'bg-zinc-200/80';
  const activeText = isDark ? 'text-blue-400' : 'text-blue-600';
  const inactiveText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  const renderChip = (target: PickerMode, label: string) => {
    const isActive = mode === target;
    const chipBg = isActive ? activeChipBg : inactiveChipBg;
    // 이미 선택된 칩 탭 시 active opacity 피드백 제거 — 의미 없는 동작이라 피드백 약화
    const activePressClass = isActive ? '' : 'active:opacity-70';
    return (
      <Pressable
        onPress={() => onSelectMode(target)}
        accessibilityRole="button"
        accessibilityLabel={`${target === 'date' ? '날짜' : '시간'} 모드`}
        accessibilityState={{ selected: isActive }}
        hitSlop={6}
        className={`rounded-lg px-3 py-1.5 ${activePressClass} ${chipBg}`}
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
