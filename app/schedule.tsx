import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import MobileLayout from '@/components/common/MobileLayout';
import CalendarHeader from '@/components/schedule/CalendarHeader';
import ScheduleHeaderActions from '@/components/schedule/ScheduleHeaderActions';
import ReservationCard from '@/components/schedule/ReservationCard';
import EmptyState from '@/components/schedule/EmptyState';
import ScheduleDetailSheet from '@/components/schedule/ScheduleDetailSheet';
import MonthPickerSheet from '@/components/schedule/MonthPickerSheet';
import { PALETTE } from '@/constants/colors';
import { WEEKDAY_LABELS } from '@/constants/schedule';
import { useTrips } from '@/hooks/trip/useTrips';
import { useTripDetail } from '@/hooks/trip/useTripDetail';
import { useDeleteTrip } from '@/hooks/trip/useDeleteTrip';
import type { ScheduleItem } from '@/types/schedule.types';

const SECTION_PADDING_CLASS = 'px-5';
const LIST_SPACING_CLASS = 'gap-3';
const SUMMARY_VERTICAL_CLASS = 'py-3';
const LOAD_ERROR_MESSAGE = '일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export default function ScheduleScreen() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const [displayMonth, setDisplayMonth] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const { trips, isLoading, error, refetch } = useTrips(selectedDate);
  const { detail } = useTripDetail(selectedSchedule?.id ?? null);
  const { remove } = useDeleteTrip();

  const pageBg = 'bg-zinc-50';
  const cardBg = 'bg-white';
  const dividerBorder = 'border-zinc-100';
  const headingText = 'text-zinc-900';
  const subText = 'text-zinc-500';

  // API가 선택 날짜로 이미 필터링한 결과를 그대로 노출.
  const visibleScheduleList = trips;

  // MVP: 월 전체 마커는 후속 이슈로 분리. 현재 로드된 선택일에 일정이 있으면 그 날만 점 표시.
  const markedDays = useMemo(() => {
    if (!isSameMonth(selectedDate, displayMonth) || trips.length === 0) return [];
    return [selectedDate.getDate()];
  }, [selectedDate, displayMonth, trips.length]);

  const summaryDateText = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${WEEKDAY_LABELS[selectedDate.getDay()]})`;
  const summaryCountText =
    visibleScheduleList.length > 0
      ? `일정 ${visibleScheduleList.length}건`
      : '등록된 일정이 없어요';

  const handleNavigateToNew = () => {
    router.push('/search');
  };

  const handleDelete = async (id: number) => {
    const ok = await remove(id);
    if (ok) {
      setSelectedSchedule(null);
      refetch();
    }
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

  const renderListBody = () => {
    if (isLoading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={PALETTE.blue600} />
        </View>
      );
    }
    if (error) {
      return (
        <View className="items-center py-12">
          <Text className={`text-sm ${subText}`}>{LOAD_ERROR_MESSAGE}</Text>
        </View>
      );
    }
    if (visibleScheduleList.length === 0) {
      return <EmptyState onPressNew={handleNavigateToNew} />;
    }
    return visibleScheduleList.map((schedule) => (
      <ReservationCard
        key={schedule.id}
        schedule={schedule}
        onDelete={() => handleDelete(schedule.id)}
        onTap={() => handleOpenDetail(schedule)}
      />
    ));
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
          {renderListBody()}
        </View>
      </ScrollView>

      <ScheduleDetailSheet
        schedule={detail ?? selectedSchedule}
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
