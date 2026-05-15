import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { WEEKDAY_LABELS } from '@/constants/schedule';

const WEEKDAY_COUNT = 7;
const CELL_BASIS = `${100 / WEEKDAY_COUNT}%`;
const DAY_CELL_PADDING_CLASS = 'p-0.5';

interface Props {
  displayMonth: Date;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** 이 날짜보다 이전 날은 선택 불가(dim 표시). 시·분 무시하고 날짜만 비교. */
  minDate?: Date;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Setup 화면용 월 그리드 캘린더 picker.
 * - 좌우 chevron으로 월 이동, 날짜 셀 탭으로 선택.
 * - 선택일은 blue 톤 강조(시안 기준 dot/today 강조 없음).
 */
export default function DateCalendarPicker({
  displayMonth,
  selectedDate,
  onSelect,
  onPrevMonth,
  onNextMonth,
  minDate,
}: Props) {
  const { isDark } = useTheme();

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const minDay = minDate ? startOfDay(minDate) : null;

  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const chevronColor = isDark ? PALETTE.blue400 : PALETTE.blue600;
  const defaultDayText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const disabledDayText = isDark ? 'text-zinc-600' : 'text-zinc-300';
  const selectedBg = isDark ? 'bg-blue-500/25' : 'bg-blue-100';
  const selectedText = isDark ? 'text-blue-400' : 'text-blue-600';

  const renderDayCell = (day: number) => {
    const dateOfDay = new Date(year, month, day);
    const selected = isSameDay(dateOfDay, selectedDate);
    const disabled = minDay !== null && dateOfDay.getTime() < minDay.getTime();

    let innerStateClass = '';
    let dayTextClass = defaultDayText;
    if (selected) {
      innerStateClass = selectedBg;
      dayTextClass = `${selectedText} font-bold`;
    } else if (disabled) {
      dayTextClass = disabledDayText;
    }

    const pressableActiveClass = disabled ? '' : 'active:opacity-60';

    return (
      <View key={day} className={DAY_CELL_PADDING_CLASS} style={{ width: CELL_BASIS }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${month + 1}월 ${day}일${disabled ? ' (선택 불가)' : ' 선택'}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onSelect(dateOfDay)}
          className={`aspect-square items-center justify-center rounded-full ${pressableActiveClass} ${innerStateClass}`}
        >
          <Text className={`text-base font-medium ${dayTextClass}`}>{day}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="px-3 py-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className={`text-base font-bold ${labelText}`}>
          {year}년 {month + 1}월
        </Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={onPrevMonth}
            accessibilityRole="button"
            accessibilityLabel="이전 달"
            hitSlop={8}
          >
            <ChevronLeft size={ICON_SIZE.header} color={chevronColor} />
          </Pressable>
          <Pressable
            onPress={onNextMonth}
            accessibilityRole="button"
            accessibilityLabel="다음 달"
            hitSlop={8}
          >
            <ChevronRight size={ICON_SIZE.header} color={chevronColor} />
          </Pressable>
        </View>
      </View>

      <View className="mb-1 flex-row">
        {WEEKDAY_LABELS.map((d) => (
          <View key={d} className="py-1" style={{ width: CELL_BASIS }}>
            <Text className={`text-center text-xs font-medium ${subText}`}>{d}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDay }).map((_, i) => (
          <View
            key={`empty-${i}`}
            className={DAY_CELL_PADDING_CLASS}
            style={{ width: CELL_BASIS }}
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => renderDayCell(i + 1))}
      </View>
    </View>
  );
}
