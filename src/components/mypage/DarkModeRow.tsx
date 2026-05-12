import { Pressable, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '다크 모드';
const ROW_GAP_CLASS = 'gap-3';
const TRACK_WIDTH_CLASS = 'h-7 w-12';
const KNOB_SIZE_CLASS = 'h-5 w-5';

interface DarkModeRowProps {
  noBorder?: boolean;
}

export default function DarkModeRow({ noBorder }: DarkModeRowProps) {
  const { isDark, toggle } = useTheme();

  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const trackBg = isDark ? 'bg-blue-500' : 'bg-zinc-300';
  const knobPosition = isDark ? 'translate-x-6' : 'translate-x-1';
  const Icon = isDark ? Moon : Sun;
  const borderClass = (() => {
    if (noBorder) return '';
    return isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100';
  })();

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityLabel={LABEL}
      accessibilityState={{ checked: isDark }}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Icon size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <View className={`relative items-start justify-center rounded-full ${TRACK_WIDTH_CLASS} ${trackBg}`}>
        <View className={`${KNOB_SIZE_CLASS} rounded-full bg-white shadow ${knobPosition}`} />
      </View>
    </Pressable>
  );
}
