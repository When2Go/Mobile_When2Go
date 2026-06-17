import { Pressable, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { DEPART_BUTTON_LABEL } from '@/constants/setup';

interface Props {
  disabled: boolean;
  onPress: () => void;
}

/**
 * 출발 시간 계산 CTA.
 * - full-width blue 버튼 + 우측 ArrowRight.
 * - disabled 시 opacity 50.
 */
export default function DepartButton({ disabled, onPress }: Props) {
  const baseBg = 'bg-blue-600';
  const activeBg = 'active:bg-blue-700';
  const opacityClass = disabled ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={DEPART_BUTTON_LABEL}
      accessibilityState={{ disabled }}
      className={`w-full rounded-2xl py-4 ${baseBg} ${activeBg} ${opacityClass}`}
    >
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-base font-bold text-white">{DEPART_BUTTON_LABEL}</Text>
        <ArrowRight size={ICON_SIZE.header} color={PALETTE.white} />
      </View>
    </Pressable>
  );
}
