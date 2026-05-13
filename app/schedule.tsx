import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import MobileLayout from '@/components/common/MobileLayout';
import CalendarHeader from '@/components/schedule/CalendarHeader';
import ScheduleHeaderActions from '@/components/schedule/ScheduleHeaderActions';
import ReservationCard from '@/components/schedule/ReservationCard';
import EmptyState from '@/components/schedule/EmptyState';
import ScheduleDetailSheet from '@/components/schedule/ScheduleDetailSheet';
import MonthPickerSheet from '@/components/schedule/MonthPickerSheet';
import { useTheme } from '@/contexts/ThemeContext';
import {
  INITIAL_SCHEDULES,
  MOCK_MARKED_OFFSETS_FROM_TODAY,
  WEEKDAY_LABELS,
} from '@/constants/schedule';
import type { ScheduleItem } from '@/types/schedule.types';

const SECTION_PADDING_CLASS = 'px-5';
const LIST_SPACING_CLASS = 'gap-3';
const SUMMARY_VERTICAL_CLASS = 'py-3';

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function buildMarkedDays(today: Date): number[] {
  return MOCK_MARKED_OFFSETS_FROM_TODAY.map((offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    if (date.getMonth() !== today.getMonth()) {
      return null;
    }
    return date.getDate();
  }).filter((value): value is number => value !== null);
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const today = useMemo(() => new Date(), []);

  const [displayMonth, setDisplayMonth] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const dividerBorder = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';

  // mock 단순화: 일정 데이터는 "오늘"에만 존재. 다른 날·다른 월은 빈 상태.
  const visibleScheduleList = isSameDay(selectedDate, today) ? scheduleList : [];

  // dot도 현재 표시 중인 달이 today의 월과 같을 때만 (실데이터 연동 시 markedDays는 그 달의 일정 day로 대체).
  const markedDays = useMemo(() => {
    if (!isSameMonth(displayMonth, today)) return [];
    return buildMarkedDays(today);
  }, [displayMonth, today]);

  const summaryDateText = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${WEEKDAY_LABELS[selectedDate.getDay()]})`;
  const summaryCountText =
    visibleScheduleList.length > 0
      ? `일정 ${visibleScheduleList.length}건`
      : '등록된 일정이 없어요';

  const handleNavigateToNew = () => {
    router.push('/search');
  };

  const handleDelete = (id: number) => {
    setScheduleList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOpenDetail = (item: ScheduleItem) => {
    setSelectedSchedule(item);
  };

  const handleCloseDetail = () => {
    setSelectedSchedule(null);
  };

  const handleSelectMonth = (date: Date) => {
    setDisplayMonth(date);
    // 새 월로 이동 시 선택일을 자연스럽게 그 월의 오늘(같은 월이면) 또는 1일로.
    if (isSameMonth(date, today)) {
      setSelectedDate(today);
    } else {
      setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <MobileLayout>
      <ScrollView className={`flex-1 ${pageBg}`} contentContainerClassName="pb-8">
        <View className={`${cardBg} border-b ${dividerBorder}`}>
          <CalendarHeader
            displayMonth={displayMonth}
            selectedDate={selectedDate}
            today={today}
            onSelect={setSelectedDate}
            markedDays={markedDays}
            onPressMonthIcon={() => setMonthPickerOpen(true)}
          />
          <ScheduleHeaderActions onPressNew={handleNavigateToNew} />
        </View>

        <View
          className={`${SECTION_PADDING_CLASS} ${SUMMARY_VERTICAL_CLASS} ${cardBg} mt-2 border-b ${dividerBorder}`}
        >
          <Text className={`text-sm font-semibold ${headingText}`}>{summaryDateText}</Text>
          <Text className={`mt-1 text-xs ${subText}`}>{summaryCountText}</Text>
        </View>

        <View className={`${SECTION_PADDING_CLASS} pt-4 ${LIST_SPACING_CLASS}`}>
          {visibleScheduleList.length === 0 ? (
            <EmptyState onPressNew={handleNavigateToNew} />
          ) : (
            visibleScheduleList.map((schedule) => (
              <ReservationCard
                key={schedule.id}
                schedule={schedule}
                onDelete={() => handleDelete(schedule.id)}
                onTap={() => handleOpenDetail(schedule)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ScheduleDetailSheet
        schedule={selectedSchedule}
        isOpen={selectedSchedule !== null}
        onClose={handleCloseDetail}
        onDelete={handleDelete}
      />

      <MonthPickerSheet
        isOpen={isMonthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        currentMonth={displayMonth}
        today={today}
        onSelect={handleSelectMonth}
      />
    </MobileLayout>
  );
}
