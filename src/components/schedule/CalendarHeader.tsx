import { Pressable, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { WEEKDAY_LABELS } from '@/constants/schedule';

const DAY_CELL_HEIGHT_CLASS = 'h-9';
const DOT_SIZE_CLASS = 'h-1 w-1';
const DAY_CELL_PADDING_CLASS = 'p-0.5';
const WEEKDAY_COUNT = 7;
const CELL_BASIS = `${100 / WEEKDAY_COUNT}%`;

interface CalendarHeaderProps {
  /** 화면에 그릴 월 — 이 월의 1일부터 마지막 날까지 셀로 깐다. */
  displayMonth: Date;
  /** 현재 선택된 날짜. */
  selectedDate: Date;
  /** 오늘 — "오늘" 셀 강조용. displayMonth와 다른 월일 수도 있다. */
  today: Date;
  onSelect: (date: Date) => void;
  /** 일정이 있는 displayMonth 기준 day-of-month 목록 (1~31). dot 표시용. */
  markedDays: number[];
  /** 우상단 캘린더 아이콘 탭 콜백. 월 선택 시트 열기 등에 사용. */
  onPressMonthIcon: () => void;
}

/**
 * 월 헤더 + grid-7 미니 캘린더.
 * - 오늘은 파란 동그라미로 강조 (displayMonth가 today의 월과 같을 때만).
 * - 선택된 날짜는 별도 outline 강조.
 * - markedDays에 해당하는 날 하단에 작은 dot.
 * - 우상단 캘린더 아이콘 → onPressMonthIcon (월 선택 시트 트리거).
 */
export default function CalendarHeader({
  displayMonth,
  selectedDate,
  today,
  onSelect,
  markedDays,
  onPressMonthIcon,
}: CalendarHeaderProps) {
  const { isDark } = useTheme();

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const isCurrentMonthSameAsToday =
    year === today.getFullYear() && month === today.getMonth();

  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const defaultDayText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const dotBg = isDark ? 'bg-blue-400' : 'bg-blue-500';
  const selectedRingBorder = isDark ? 'border-blue-400' : 'border-blue-500';

  const renderDayCell = (day: number) => {
    const dateOfDay = new Date(year, month, day);
    const isToday = isCurrentMonthSameAsToday && day === today.getDate();
    const isSelected =
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day;
    const hasSchedule = markedDays.includes(day);

    const innerStateClass = (() => {
      if (isToday) return 'bg-blue-600';
      if (isSelected) return `border ${selectedRingBorder}`;
      return '';
    })();

    const dayTextClass = (() => {
      if (isToday) return 'text-white font-bold';
      return defaultDayText;
    })();

    return (
      <View key={day} className={DAY_CELL_PADDING_CLASS} style={{ width: CELL_BASIS }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${month + 1}월 ${day}일 선택`}
          onPress={() => onSelect(dateOfDay)}
          className={`relative ${DAY_CELL_HEIGHT_CLASS} items-center justify-center rounded-lg active:opacity-60 ${innerStateClass}`}
        >
          <Text className={`text-sm ${dayTextClass}`}>{day}</Text>
          {hasSchedule && !isToday ? (
            <View
              className={`absolute bottom-1 ${DOT_SIZE_CLASS} rounded-full ${dotBg}`}
            />
          ) : null}
        </Pressable>
      </View>
    );
  };

  return (
    <View className="px-5 py-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className={`text-base font-bold ${labelText}`}>
          {year}년 {month + 1}월
        </Text>
        <Pressable
          onPress={onPressMonthIcon}
          accessibilityRole="button"
          accessibilityLabel="월 선택 열기"
          hitSlop={12}
          className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
        >
          <Calendar size={ICON_SIZE.header} color={subIconColor} />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View
            key={label}
            className={`${DAY_CELL_HEIGHT_CLASS} items-center justify-center`}
            style={{ width: CELL_BASIS }}
          >
            <Text className={`text-xs font-semibold ${subText}`}>{label}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDay }).map((_, i) => (
          <View
            key={`empty-${i}`}
            className={`${DAY_CELL_HEIGHT_CLASS} ${DAY_CELL_PADDING_CLASS}`}
            style={{ width: CELL_BASIS }}
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => renderDayCell(i + 1))}
      </View>
    </View>
  );
}
