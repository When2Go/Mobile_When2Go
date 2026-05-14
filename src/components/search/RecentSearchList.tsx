import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Clock, X } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const MOCK_RECENT: string[] = [
  '인하대역',
  '스타벅스 주안역점',
  '용산역',
  '강남역',
  '홍대입구역',
  '서울시청',
  '부평구청',
];

interface Props {
  onSelect: (item: string) => void;
}

export default function RecentSearchList({ onSelect }: Props) {
  const { isDark } = useTheme();
  const [items, setItems] = useState<string[]>(MOCK_RECENT);

  const handleDelete = (item: string) => setItems((prev) => prev.filter((i) => i !== item));
  const handleClearAll = () => setItems([]);

  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const label = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';

  if (items.length === 0) {
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
          onPress={handleClearAll}
          accessibilityRole="button"
          accessibilityLabel="전체 삭제"
          hitSlop={8}
        >
          <Text className={`text-[11px] ${sub}`}>전체 삭제</Text>
        </Pressable>
      </View>

      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={item}
          className={`flex-row items-center justify-between border-b py-3 active:opacity-60 ${divider}`}
        >
          <View className="flex-row items-center gap-3">
            <Clock size={ICON_SIZE.header} color={isDark ? PALETTE.zinc500 : PALETTE.zinc400} />
            <Text className={`text-[15px] font-medium ${label}`}>{item}</Text>
          </View>
          <Pressable
            onPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item} 삭제`}
            hitSlop={8}
          >
            <X size={ICON_SIZE.card} color={isDark ? PALETTE.zinc500 : PALETTE.zinc300} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}
