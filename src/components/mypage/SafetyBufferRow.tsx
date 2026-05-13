import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Shield } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '안전 버퍼 시간';
const ROW_GAP_CLASS = 'gap-3';

interface SafetyBufferRowProps {
  value: number;
  onPress: () => void;
  noBorder?: boolean;
}

// 행은 표시 + 시트 오픈 트리거만 담당. 시트와 onChange는 부모(app/mypage.tsx)가 관리한다.
export default function SafetyBufferRow({ value, onPress, noBorder }: SafetyBufferRowProps) {
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const valueText = isDark ? 'text-blue-400' : 'text-blue-500';
  const chevronColor = isDark ? PALETTE.zinc700 : PALETTE.zinc300;
  const borderClass = (() => {
    if (noBorder) return '';
    return isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100';
  })();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${LABEL} 설정, 현재 ${value}분`}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Shield size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className={`text-sm font-semibold ${valueText}`}>{value}분</Text>
        <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
      </View>
    </Pressable>
  );
}
