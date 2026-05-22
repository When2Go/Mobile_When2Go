import { Pressable, Text, View } from 'react-native';
import { Clock, X } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';
import type { Place } from '@/api/kakao/types';

interface Props {
  onSelect: (place: Place) => void;
}

export default function RecentSearchList({ onSelect }: Props) {
  const { isDark } = useTheme();
  const { recentPlaces, removeRecentPlace, clearAll } = useRecentSearches();

  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const label = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';

  if (recentPlaces.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className={`text-sm ${sub}`}>최근 검색 기록이 없습니다</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className={`text-xs font-semibold ${sub}`}>최근 검색</Text>
        <Pressable
          onPress={clearAll}
          accessibilityRole="button"
          accessibilityLabel="전체 삭제"
          hitSlop={8}
        >
          <Text className={`text-[11px] ${sub}`}>전체 삭제</Text>
        </Pressable>
      </View>

      {recentPlaces.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          className={`flex-row items-center justify-between border-b py-3 active:opacity-60 ${divider}`}
        >
          <View className="flex-row items-center gap-3">
            <Clock size={ICON_SIZE.header} color={isDark ? PALETTE.zinc500 : PALETTE.zinc400} />
            <View className="flex-1">
              <Text className={`text-[15px] font-medium ${label}`}>{item.name}</Text>
              <Text className={`text-xs ${sub}`}>{item.address}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => removeRecentPlace(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 삭제`}
            hitSlop={8}
          >
            <X size={ICON_SIZE.card} color={isDark ? PALETTE.zinc500 : PALETTE.zinc300} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}
