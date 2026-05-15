import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import {
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  PERIOD_OPTIONS,
  TIME_RANGE_NOTICE,
  type Period,
} from '@/constants/setup';

const WHEEL_HEIGHT_CLASS = 'h-56';
/** 중앙 강조 박스 위/아래에 보일 mock 항목 수. */
const VISIBLE_SIDE_COUNT = 2;
const ROW_GAP_CLASS = 'gap-1.5';

interface Props {
  period: Period;
  hour: number;
  minute: number;
  onPeriodChange: (period: Period) => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

/**
 * iOS 스타일 시간 휠(mock).
 * - 3열 grid: 오전·오후 / 시 / 분
 * - 중앙 강조 박스 + 위아래 페이딩(opacity)으로 휠 정렬을 흉내.
 * - 휠 제스처는 mock — 항목 탭으로만 선택 변경.
 * - 하단 빨간 안내 박스: 시간 상한.
 */
export default function TimeWheelPicker({
  period,
  hour,
  minute,
  onPeriodChange,
  onHourChange,
  onMinuteChange,
}: Props) {
  const { isDark } = useTheme();

  const centerBoxBg = isDark ? 'bg-zinc-700/60' : 'bg-white';
  const activeText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const baseText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const dimText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const noticeBg = isDark ? 'bg-red-900/20' : 'bg-red-50';
  const noticeText = isDark ? 'text-red-400' : 'text-red-500';

  /** 중앙 강조 박스 — absolute로 중앙에 깔리는 mock 가이드. */
  const renderCenterBar = () => (
    <View
      pointerEvents="none"
      className={`absolute inset-x-3 top-1/2 -mt-5 h-10 rounded-xl ${centerBoxBg}`}
    />
  );

  /**
   * 중앙 정렬 휠 컬럼 mock.
   * - selectedIndex 기준 위/아래로 VISIBLE_SIDE_COUNT 만큼 옆 항목을 dim 처리해서 보여준다.
   * - 탭하면 해당 값으로 onSelect 호출.
   */
  const renderWheelColumn = <T,>(
    options: readonly T[],
    selected: T,
    onSelect: (value: T) => void,
    format: (value: T) => string,
    align: 'start' | 'center' | 'end',
  ) => {
    const selectedIndex = Math.max(0, options.indexOf(selected));
    const slots: (T | null)[] = [];
    for (let offset = -VISIBLE_SIDE_COUNT; offset <= VISIBLE_SIDE_COUNT; offset += 1) {
      const idx = selectedIndex + offset;
      slots.push(idx >= 0 && idx < options.length ? options[idx] : null);
    }

    const alignByPosition: Record<typeof align, string> = {
      start: 'items-start pl-3',
      end: 'items-end pr-3',
      center: 'items-center',
    };
    const alignClass = alignByPosition[align];

    return (
      <View className={`flex-1 justify-center ${alignClass} ${ROW_GAP_CLASS}`}>
        {slots.map((value, i) => {
          const offset = i - VISIBLE_SIDE_COUNT;
          const distance = Math.abs(offset);
          const isCenter = distance === 0;
          if (value === null) {
            // 빈 슬롯도 높이 유지 — 시안의 opacity-0 span과 동일 의도.
            // key는 selectedIndex 기준 offset(-2..+2)으로 부여해 의미적으로 unique.
            return (
              <Text key={`empty-offset-${offset}`} className="text-2xl opacity-0">
                {' '}
              </Text>
            );
          }
          let textClass: string;
          if (isCenter) {
            textClass = `text-2xl font-medium ${activeText}`;
          } else if (distance === 1) {
            textClass = `text-2xl ${baseText}`;
          } else {
            textClass = `text-xl opacity-50 ${dimText}`;
          }
          return (
            <Pressable
              key={`${i}-${format(value)}`}
              onPress={() => onSelect(value)}
              accessibilityRole="button"
              hitSlop={4}
            >
              <Text className={textClass}>{format(value)}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const formatHour = (h: number) => String(h);
  const formatMinute = (m: number) => String(m).padStart(2, '0');
  const formatPeriod = (p: Period) => p;

  return (
    <View>
      <View className={`relative overflow-hidden ${WHEEL_HEIGHT_CLASS}`}>
        {renderCenterBar()}
        <View className="relative h-full flex-row">
          {renderWheelColumn<Period>(PERIOD_OPTIONS, period, onPeriodChange, formatPeriod, 'end')}
          {renderWheelColumn<number>(HOUR_OPTIONS, hour, onHourChange, formatHour, 'center')}
          {renderWheelColumn<number>(MINUTE_OPTIONS, minute, onMinuteChange, formatMinute, 'start')}
        </View>
      </View>

      <View className={`mx-3 mb-3 mt-1 items-center justify-center rounded-xl py-2 ${noticeBg}`}>
        <Text className={`text-xs font-medium ${noticeText}`}>{TIME_RANGE_NOTICE}</Text>
      </View>
    </View>
  );
}
