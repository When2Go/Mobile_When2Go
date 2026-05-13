import { Pressable, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { WEEKDAY_LABELS } from '@/constants/schedule';

const DAY_CELL_HEIGHT_CLASS = 'h-9';
const DOT_SIZE_CLASS = 'h-1 w-1';
const DAY_GAP_CLASS = 'gap-1';

interface CalendarHeaderProps {
  /** 현재 선택된 날짜. 오늘일 수도, 다른 날일 수도 있다. */
  selectedDate: Date;
  onSelect: (date: Date) => void;
  /** 일정이 있는 날짜의 day-of-month 목록 (1~31). dot 표시용. */
  markedDays: number[];
}

/**
 * 월 헤더 + grid-7 미니 캘린더.
 * - 오늘은 파란 동그라미로 강조.
 * - 선택된 날짜는 별도 outline 강조.
 * - markedDays에 해당하는 날 하단에 작은 dot.
 */
export default function CalendarHeader({
  selectedDate,
  onSelect,
  markedDays,
}: CalendarHeaderProps) {
  const { isDark } = useTheme();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const defaultDayText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const dotBg = isDark ? 'bg-blue-400' : 'bg-blue-500';
  const selectedRingBorder = isDark ? 'border-blue-400' : 'border-blue-500';

  const renderDayCell = (day: number) => {
    const dateOfDay = new Date(year, month, day);
    const isToday = day === today.getDate();
    const isSelected =
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day;
    const hasSchedule = markedDays.includes(day);

    const baseCellClass = `relative ${DAY_CELL_HEIGHT_CLASS} items-center justify-center rounded-lg active:opacity-60`;

    const stateClass = (() => {
      if (isToday) return 'bg-blue-600';
      if (isSelected) return `border ${selectedRingBorder}`;
      return '';
    })();

    const dayTextClass = (() => {
      if (isToday) return 'text-white font-bold';
      return defaultDayText;
    })();

    return (
      <Pressable
        key={day}
        accessibilityRole="button"
        accessibilityLabel={`${month + 1}월 ${day}일 선택`}
        onPress={() => onSelect(dateOfDay)}
        className={`${baseCellClass} ${stateClass}`}
        style={{ flexBasis: '14.2857%' }}
      >
        <Text className={`text-sm ${dayTextClass}`}>{day}</Text>
        {hasSchedule && !isToday ? (
          <View
            className={`absolute bottom-1 ${DOT_SIZE_CLASS} rounded-full ${dotBg}`}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View className="px-5 py-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className={`text-base font-bold ${labelText}`}>
          {year}년 {month + 1}월
        </Text>
        <Calendar size={ICON_SIZE.header} color={subIconColor} />
      </View>

      <View className={`flex-row flex-wrap ${DAY_GAP_CLASS}`}>
        {WEEKDAY_LABELS.map((label) => (
          <View
            key={label}
            className={`${DAY_CELL_HEIGHT_CLASS} items-center justify-center`}
            style={{ flexBasis: '14.2857%' }}
          >
            <Text className={`text-xs font-semibold ${subText}`}>{label}</Text>
          </View>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <View
            key={`empty-${i}`}
            className={DAY_CELL_HEIGHT_CLASS}
            style={{ flexBasis: '14.2857%' }}
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => renderDayCell(i + 1))}
      </View>
    </View>
  );
}
