import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const PLACEHOLDER = '어디로 갈까요?';

/**
 * Home 상단에 떠 있는 검색 진입 바. 탭 시 `/search` 라우트로 이동.
 * 실제 입력은 search 화면에서. 여기서는 진입 트리거만.
 */
export default function SearchEntryBar() {
  const router = useRouter();
  const { isDark } = useTheme();

  const barBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100';
  const placeholderText = isDark ? 'text-zinc-400' : 'text-zinc-400';
  const iconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc400;

  return (
    <Pressable
      onPress={() => router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel="목적지 검색"
      className={`h-14 w-full flex-row items-center gap-3 rounded-2xl border px-4 active:opacity-80 ${barBg}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Search size={ICON_SIZE.header} color={iconColor} />
      <Text className={`flex-1 text-base ${placeholderText}`}>{PLACEHOLDER}</Text>
    </Pressable>
  );
}
