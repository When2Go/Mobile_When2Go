import { Pressable } from 'react-native';
import { Mic } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

interface Props {
  onPress: () => void;
}

export default function VoiceButton({ onPress }: Props) {
  const btnBg = 'bg-blue-50';
  const iconColor = PALETTE.blue600;

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
