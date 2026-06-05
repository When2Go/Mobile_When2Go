import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const PLACEHOLDER = '어디로 갈까요?';
const SHADOW_OPACITY = 0.12;

/**
 * Home 상단에 떠 있는 검색 진입 바. 탭 시 `/search` 라우트로 이동.
 * 실제 입력은 search 화면에서. 여기서는 진입 트리거만.
 */
export default function SearchEntryBar() {
  const router = useRouter();

  const barBg = 'bg-white border-zinc-100';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/search', params: { field: 'to' } })}
      accessibilityRole="button"
      accessibilityLabel="목적지 검색"
      className={`h-14 w-full flex-row items-center gap-3 rounded-2xl border px-4 active:opacity-80 ${barBg}`}
      style={{
        shadowColor: PALETTE.zinc950,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: SHADOW_OPACITY,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Search size={ICON_SIZE.header} color={PALETTE.zinc400} />
      <Text className="flex-1 text-base text-zinc-400">{PLACEHOLDER}</Text>
    </Pressable>
  );
}
