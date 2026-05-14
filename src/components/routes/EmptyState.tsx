import { Pressable, Text, View } from 'react-native';
import { Navigation, Plus } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';

const ICON_CIRCLE_SIZE = 96;
const NAV_ICON_SIZE = 48;

interface EmptyStateProps {
  onAddPress: () => void;
}

export default function EmptyState({ onAddPress }: EmptyStateProps) {
  const { isDark } = useTheme();

  const iconCircleBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <View className="flex-1 items-center justify-center px-8 pb-20">
      <View
        className={`mb-6 items-center justify-center rounded-full ${iconCircleBg}`}
        style={{ width: ICON_CIRCLE_SIZE, height: ICON_CIRCLE_SIZE }}
      >
        <Navigation size={NAV_ICON_SIZE} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
      </View>
      <Text className={`mb-2 text-center text-xl font-bold ${heading}`}>
        등록된 경로가 없어요
      </Text>
      <Text className={`mb-8 text-center text-sm leading-relaxed ${sub}`}>
        {'자주 사용하는 경로를 등록하면\n빠르게 출발 시간을 확인할 수 있어요'}
      </Text>
      <Pressable
        onPress={onAddPress}
        accessibilityRole="button"
        className="flex-row items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 active:bg-blue-700"
      >
        <Plus size={ICON_SIZE.header} color={PALETTE.white} />
        <Text className="font-bold text-white">경로 추가하기</Text>
      </Pressable>
    </View>
  );
}
