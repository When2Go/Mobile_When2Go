import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronRight, Repeat2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '반복 예약';
const ROW_GAP_CLASS = 'gap-3';
// 현재 /repeat 라우트는 미존재 — 추후 화면 추가 시 자동 연결되도록 placeholder push 유지
const REPEAT_ROUTE = '/repeat' as Href;
const MOCK_REPEAT_COUNT = 2;

interface RepeatReservationLinkProps {
  noBorder?: boolean;
}

export default function RepeatReservationLink({ noBorder }: RepeatReservationLinkProps) {
  const router = useRouter();
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const countText = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const chevronColor = isDark ? PALETTE.zinc700 : PALETTE.zinc300;
  const borderClass = (() => {
    if (noBorder) return '';
    return isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100';
  })();

  return (
    <Pressable
      onPress={() => router.push(REPEAT_ROUTE)}
      accessibilityRole="button"
      accessibilityLabel={`${LABEL} ${MOCK_REPEAT_COUNT}개`}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Repeat2 size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className={`text-sm ${countText}`}>{MOCK_REPEAT_COUNT}개</Text>
        <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
      </View>
    </Pressable>
  );
}
