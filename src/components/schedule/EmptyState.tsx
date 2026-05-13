import { Pressable, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';

const ICON_BUBBLE_SIZE_CLASS = 'h-20 w-20';
const BIG_CALENDAR_SIZE = 40;

interface EmptyStateProps {
  onPressNew: () => void;
}

/** 선택한 날짜에 일정이 없을 때 노출되는 빈 상태. */
export default function EmptyState({ onPressNew }: EmptyStateProps) {
  const { isDark } = useTheme();

  const bubbleBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const linkText = isDark ? 'text-blue-400' : 'text-blue-500';

  return (
    <View className="items-center justify-center gap-3 py-16">
      <View
        className={`items-center justify-center rounded-full ${ICON_BUBBLE_SIZE_CLASS} ${bubbleBg}`}
      >
        <Calendar size={BIG_CALENDAR_SIZE} color={subIconColor} />
      </View>
      <Text className={`text-sm font-medium ${subText}`}>이 날짜에 예약이 없어요</Text>
      <Pressable
        onPress={onPressNew}
        accessibilityRole="button"
        accessibilityLabel="새 일정 추가하기"
        className="active:opacity-60"
      >
        <Text className={`text-sm font-semibold ${linkText}`}>+ 새 일정 추가하기</Text>
      </Pressable>
    </View>
  );
}
