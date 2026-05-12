import { Pressable, Text, View } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '알림 방식';
const VALUE_TEXT = '기기 설정';
const ROW_GAP_CLASS = 'gap-3';

interface NotificationSettingsRowProps {
  onPress: () => void;
  noBorder?: boolean;
}

// 소리/진동은 OS 권한이라 기기 설정에서만 바꿀 수 있다. 행 자체는 설정 앱으로
// 이동하는 진입점 역할만 하고, 실제 이동은 부모(app/mypage.tsx)가 결정한다.
export default function NotificationSettingsRow({
  onPress,
  noBorder,
}: NotificationSettingsRowProps) {
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const valueText = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const chevronColor = isDark ? PALETTE.zinc700 : PALETTE.zinc300;
  const borderClass = (() => {
    if (noBorder) return '';
    return isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100';
  })();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${LABEL} — ${VALUE_TEXT}으로 이동`}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Bell size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className={`text-sm font-semibold ${valueText}`}>{VALUE_TEXT}</Text>
        <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
      </View>
    </Pressable>
  );
}
