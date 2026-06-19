import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronRight, LayoutTemplate } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '잠금화면 위젯';
const ROW_GAP_CLASS = 'gap-3';
const LOCKWIDGET_ROUTE = '/lockwidget' as Href;

interface LockWidgetLinkProps {
  noBorder?: boolean;
}

/** 마이페이지 → 잠금화면 위젯 미리보기 진입 행 (이슈 #13). */
export default function LockWidgetLink({ noBorder }: LockWidgetLinkProps) {
  const router = useRouter();

  const labelText = 'text-zinc-800';
  const chevronColor = PALETTE.zinc300;
  const borderClass = noBorder ? '' : 'border-b border-zinc-100';

  return (
    <Pressable
      onPress={() => router.push(LOCKWIDGET_ROUTE)}
      accessibilityRole="button"
      accessibilityLabel={LABEL}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <LayoutTemplate size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
    </Pressable>
  );
}
