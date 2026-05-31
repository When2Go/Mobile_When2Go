import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { usePlaceSearch } from '@/hooks/search/usePlaceSearch';
import type { Place } from '@/api/kakao/types';

interface Props {
  query: string;
  onSelect: (place: Place) => void;
}

export default function SearchResultList({ query, onSelect }: Props) {
  const { places, isLoading, error } = usePlaceSearch(query);

  const sub = 'text-zinc-500';
  const label = 'text-zinc-900';
  const divider = 'border-zinc-100';

  function renderContent() {
    if (isLoading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="small" color={PALETTE.zinc500} />
        </View>
      );
    }
    if (error) {
      return (
        <View className="items-center py-12">
          <Text className={`text-sm ${sub}`}>{error}</Text>
        </View>
      );
    }
    if (places.length === 0) {
      return (
        <View className="items-center py-12">
          <Text className={`text-sm ${sub}`}>{`"${query}" 검색 결과가 없습니다`}</Text>
        </View>
      );
    }
    return places.map((item) => (
      <Pressable
        key={item.id}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        className={`flex-row items-center gap-4 border-b py-3 active:opacity-60 ${divider}`}
      >
        <MapPin size={ICON_SIZE.header} color={PALETTE.zinc400} />
        <View className="flex-1">
          <Text className={`text-[15px] font-medium ${label}`}>{item.name}</Text>
          <Text className={`text-xs ${sub}`}>{item.address}</Text>
        </View>
      </Pressable>
    ));
  }

  return (
    <View>
      <Text className={`mb-3 text-xs font-semibold ${sub}`}>검색 결과</Text>
      {renderContent()}
    </View>
  );
}
