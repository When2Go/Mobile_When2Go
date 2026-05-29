import { Pressable, Text, View } from 'react-native';
import { ChevronRight, FileText } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const LABEL = '이용약관 / 개인정보 처리방침';
const ROW_GAP_CLASS = 'gap-3';

interface TermsLinkProps {
  noBorder?: boolean;
}

export default function TermsLink({ noBorder }: TermsLinkProps) {
  const labelText = 'text-zinc-800';
  const chevronColor = PALETTE.zinc300;
  const borderClass = noBorder ? '' : 'border-b border-zinc-100';

  // 추후 약관/개인정보 본문 라우팅 연결 예정 (이슈 범위 밖)
  const handlePress = () => {
    // no-op placeholder
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={LABEL}
      className={`flex-row items-center justify-between py-3 active:opacity-60 ${borderClass}`}
    >
      <View className={`flex-row items-center ${ROW_GAP_CLASS}`}>
        <FileText size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <Text className={`text-[15px] font-medium ${labelText}`}>{LABEL}</Text>
      </View>
      <ChevronRight size={ICON_SIZE.card} color={chevronColor} />
    </Pressable>
  );
}
