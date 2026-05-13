import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Info } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '버전 정보';
const ROW_GAP_CLASS = 'gap-3';
const FALLBACK_VERSION = '1.0.0';

interface VersionRowProps {
  noBorder?: boolean;
}

export default function VersionRow({ noBorder }: VersionRowProps) {
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const valueText = 'text-zinc-500';
  const borderClass = (() => {
    if (noBorder) return '';
    return isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100';
  })();

  const version = Constants.expoConfig?.version ?? FALLBACK_VERSION;

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${borderClass}`}
      accessibilityRole="text"
      accessibilityLabel={`${LABEL} v${version}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <Info size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <Text className={`text-sm font-semibold ${valueText}`}>v{version}</Text>
    </View>
  );
}
