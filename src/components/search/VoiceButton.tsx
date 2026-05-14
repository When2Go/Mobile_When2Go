import { Pressable } from 'react-native';
import { Mic } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

interface Props {
  onPress: () => void;
}

export default function VoiceButton({ onPress }: Props) {
  const { isDark } = useTheme();

  const btnBg = isDark ? 'bg-blue-900/50' : 'bg-blue-50';
  const iconColor = isDark ? PALETTE.blue400 : PALETTE.blue600;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="음성 검색"
      className={`h-10 w-10 shrink-0 items-center justify-center rounded-xl active:opacity-70 ${btnBg}`}
    >
      <Mic size={ICON_SIZE.header} color={iconColor} />
    </Pressable>
  );
}
