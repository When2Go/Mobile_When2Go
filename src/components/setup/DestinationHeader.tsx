import { Pressable, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { CHANGE_BUTTON_LABEL, DESTINATION_LABEL } from '@/constants/setup';

interface Props {
  destination: string;
  onChange: () => void;
}

/**
 * Setup 상단 목적지 헤더.
 * - MapPin 아이콘(blue) + "목적지" 캡션 + 굵은 목적지 텍스트 + 우측 `변경` 버튼.
 */
export default function DestinationHeader({ destination, onChange }: Props) {
  const iconBg = 'bg-blue-100';
  const iconColor = PALETTE.blue600;
  const captionText = 'text-zinc-500';
  const headingText = 'text-zinc-900';
  const changeBg = 'bg-zinc-100';
  const changeText = 'text-zinc-600';

  return (
    <View className="flex-row items-center gap-3 px-5 py-6">
      <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
        <MapPin size={ICON_SIZE.card} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`text-xs ${captionText}`}>{DESTINATION_LABEL}</Text>
        <Text className={`text-lg font-bold ${headingText}`} numberOfLines={1}>
          {destination}
        </Text>
      </View>
      <Pressable
        onPress={onChange}
        accessibilityRole="button"
        accessibilityLabel="목적지 변경"
        hitSlop={8}
        className={`rounded-lg px-3 py-1.5 active:opacity-70 ${changeBg}`}
      >
        <Text className={`text-xs font-semibold ${changeText}`}>{CHANGE_BUTTON_LABEL}</Text>
      </Pressable>
    </View>
  );
}
