import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronRight, Repeat2 } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { useReservationStore } from '@/stores/reservationStore';

const LABEL = '반복 예약';
const ROW_GAP_CLASS = 'gap-3';
const REPEAT_ROUTE = '/repeat' as Href;

interface RepeatReservationLinkProps {
  noBorder?: boolean;
}

export default function RepeatReservationLink({ noBorder }: RepeatReservationLinkProps) {
  const router = useRouter();
  const count = useReservationStore((state) => state.items.length);

  const labelText = 'text-zinc-800';
  const countText = 'text-zinc-500';
  const chevronColor = PALETTE.zinc300;
  const borderClass = noBorder ? '' : 'border-b border-zinc-100';

  return (
    <Pressable
      onPress={() => router.push(REPEAT_ROUTE)}
      accessibilityRole="button"
      accessibilityLabel={`${LABEL} ${count}개`}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Repeat2 size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className={`text-sm ${countText}`}>{count}개</Text>
        <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
      </View>
    </Pressable>
  );
}
