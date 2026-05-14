import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const ROW_PADDING_CLASS = 'px-5 pb-2';

interface ScheduleHeaderActionsProps {
  onPressNew: () => void;
}

/**
 * Schedule 화면 캘린더 위에 떠 있는 우측 정렬 액션 행.
 * - MobileLayout 헤더가 이미 "일정" 타이틀 + 뒤로가기를 제공하므로,
 *   여기서는 "+ 새 일정" 버튼만 우측에 둔다.
 */
export default function ScheduleHeaderActions({ onPressNew }: ScheduleHeaderActionsProps) {
  const { isDark } = useTheme();

  const buttonBg = isDark ? 'bg-blue-900/40' : 'bg-blue-50';
  const buttonText = isDark ? 'text-blue-300' : 'text-blue-600';
  const buttonIconColor = isDark ? PALETTE.blue400 : PALETTE.blue600;

  return (
    <View className={`${ROW_PADDING_CLASS} flex-row justify-end`}>
      <Pressable
        onPress={onPressNew}
        accessibilityRole="button"
        accessibilityLabel="새 일정 추가"
        className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 active:opacity-80 ${buttonBg}`}
      >
        <Plus size={ICON_SIZE.card} color={buttonIconColor} />
        <Text className={`text-sm font-semibold ${buttonText}`}>새 일정</Text>
      </Pressable>
    </View>
  );
}
