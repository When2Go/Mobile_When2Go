import { Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import type { NearbyRecommendation } from '@/types/schedule.types';

interface NearbyRecommendationsProps {
  items: NearbyRecommendation[];
}

export default function NearbyRecommendations({ items }: NearbyRecommendationsProps) {
  if (items.length === 0) return null;

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5">
        <MapPin size={ICON_SIZE.card} color={PALETTE.zinc500} />
        <Text className="text-xs font-semibold text-zinc-500">주변 추천 장소</Text>
      </View>
      {items.map((item, index) => (
        <View
          key={index}
          className="rounded-xl border border-zinc-100 bg-zinc-50 p-3"
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-zinc-900">{item.name}</Text>
            <View className="rounded-full bg-blue-50 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-blue-600">{item.category}</Text>
            </View>
          </View>
          <Text className="text-xs text-zinc-500">{item.description}</Text>
        </View>
      ))}
    </View>
  );
}
