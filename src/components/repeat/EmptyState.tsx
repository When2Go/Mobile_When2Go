import { Pressable, Text, View } from 'react-native';
import { Plus, Repeat2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { EMPTY_CTA_LABEL, EMPTY_DESCRIPTION, EMPTY_TITLE } from '@/constants/repeat';

const ICON_CIRCLE_SIZE = 80;
const REPEAT_ICON_SIZE = 40;

interface EmptyStateProps {
  onAddPress: () => void;
}

export default function EmptyState({ onAddPress }: EmptyStateProps) {
  const { isDark } = useTheme();

  const iconCircleBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 pb-20">
      <View
        className={`items-center justify-center rounded-full ${iconCircleBg}`}
        style={{ width: ICON_CIRCLE_SIZE, height: ICON_CIRCLE_SIZE }}
      >
        <Repeat2 size={REPEAT_ICON_SIZE} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
      </View>
      <View>
        <Text className={`mb-1 text-center text-lg font-bold ${heading}`}>{EMPTY_TITLE}</Text>
        <Text className={`text-center text-sm leading-relaxed ${sub}`}>{EMPTY_DESCRIPTION}</Text>
      </View>
      <Pressable
        onPress={onAddPress}
        accessibilityRole="button"
        className="flex-row items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 active:bg-blue-700"
      >
        <Plus size={ICON_SIZE.header} color={PALETTE.white} />
        <Text className="font-bold text-white">{EMPTY_CTA_LABEL}</Text>
      </Pressable>
    </View>
  );
}
