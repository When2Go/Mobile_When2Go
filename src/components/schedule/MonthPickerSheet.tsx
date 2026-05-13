import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const MONTHS_PER_ROW = 3;
const MONTH_CELL_WIDTH = `${100 / MONTHS_PER_ROW}%`;
const SHEET_SNAP_POINTS = ['52%'];
const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

interface MonthPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** 현재 화면에 표시 중인 월 (선택 강조 기준). */
  currentMonth: Date;
  /** 오늘 — "오늘" 셀에 별도 dot 강조용. */
  today: Date;
  onSelect: (date: Date) => void;
}

/**
 * 년도 prev/next + 12개월 그리드. 선택 시 해당 년·월의 1일 Date로 콜백.
 */
export default function MonthPickerSheet({
  isOpen,
  onClose,
  currentMonth,
  today,
  onSelect,
}: MonthPickerSheetProps) {
  const { isDark } = useTheme();
  const [draftYear, setDraftYear] = useState<number>(currentMonth.getFullYear());

  useEffect(() => {
    if (isOpen) {
      setDraftYear(currentMonth.getFullYear());
    }
  }, [isOpen, currentMonth]);

  // 닫힘 상태에서는 sheet 자체를 mount하지 않는다 — ScheduleDetailSheet과 동일한 패턴.
  // BottomSheetModal 두 인스턴스가 동시에 mount되면 @gorhom의 modal stack에서 충돌이 일어나 자동 dismiss됨.
  if (!isOpen) {
    return null;
  }

  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const iconColor = isDark ? PALETTE.zinc300 : PALETTE.zinc700;
  const defaultCellBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const defaultCellText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const todayDotBg = isDark ? 'bg-blue-400' : 'bg-blue-500';

  const handleSelectMonth = (month: number) => {
    onSelect(new Date(draftYear, month, 1));
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="월 선택"
      snapPoints={SHEET_SNAP_POINTS}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => setDraftYear((y) => y - 1)}
          accessibilityRole="button"
          accessibilityLabel="이전 년도"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <ChevronLeft size={ICON_SIZE.header} color={iconColor} />
        </Pressable>
        <Text className={`text-lg font-bold ${headingText}`}>{draftYear}년</Text>
        <Pressable
          onPress={() => setDraftYear((y) => y + 1)}
          accessibilityRole="button"
          accessibilityLabel="다음 년도"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <ChevronRight size={ICON_SIZE.header} color={iconColor} />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap">
        {MONTH_LABELS.map((label, monthIndex) => {
          const isCurrent =
            draftYear === currentMonth.getFullYear() && monthIndex === currentMonth.getMonth();
          const isTodayMonth =
            draftYear === today.getFullYear() && monthIndex === today.getMonth();

          const cellBgClass = isCurrent ? 'bg-blue-600' : defaultCellBg;
          const cellTextClass = isCurrent ? 'text-white font-bold' : defaultCellText;

          return (
            <View key={label} className="p-1" style={{ width: MONTH_CELL_WIDTH }}>
              <Pressable
                onPress={() => handleSelectMonth(monthIndex)}
                accessibilityRole="button"
                accessibilityLabel={`${draftYear}년 ${label} 선택`}
                className={`relative h-14 items-center justify-center rounded-2xl active:opacity-60 ${cellBgClass}`}
              >
                <Text className={`text-base ${cellTextClass}`}>{label}</Text>
                {isTodayMonth && !isCurrent ? (
                  <View className={`absolute bottom-1.5 h-1 w-1 rounded-full ${todayDotBg}`} />
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </BottomSheetModal>
  );
}
