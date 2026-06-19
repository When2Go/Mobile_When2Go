import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import type { Place } from '@/api/kakao/types';

export default function RecentDestinations() {
  const router = useRouter();
  const { recentPlaces } = useRecentSearches();

  const sectionTitle = 'text-zinc-800';
  const rowBorder = 'border-zinc-100';
  const labelText = 'text-zinc-900';
  const subText = 'text-zinc-500';
  const iconBg = 'bg-zinc-100';
  const pinColor = PALETTE.zinc500;
  const emptyText = 'text-zinc-400';

  // 저장된 목적지 좌표를 draft 스토어에 주입 → setup 진입 시 재검색 없이 재사용
  const handlePress = (place: Place) => {
    const draft = useRouteDraftStore.getState();
    draft.setCoords('to', { lat: place.lat, lng: place.lng });
    draft.setToName(place.name);
    router.push({ pathname: '/setup', params: { destination: place.name } });
  };

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between px-5">
        <Text className={`text-sm font-bold ${sectionTitle}`}>최근 목적지</Text>
      </View>

      {recentPlaces.length === 0 ? (
        <View className="px-5">
          <Text className={`text-xs ${emptyText}`}>
            검색한 목적지가 여기에 최근 순으로 표시됩니다
          </Text>
        </View>
      ) : (
        <View className="px-5">
          {recentPlaces.map((place, index) => {
            const isLast = index === recentPlaces.length - 1;
            return (
              <Pressable
                key={place.id}
                onPress={() => handlePress(place)}
                accessibilityRole="button"
                accessibilityLabel={`${place.name} 목적지로 출발 시간 설정`}
                className={`flex-row items-center gap-3 py-3 active:opacity-70 ${isLast ? '' : `border-b ${rowBorder}`}`}
              >
                <View className={`h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                  <MapPin size={ICON_SIZE.card} color={pinColor} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${labelText}`} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text className={`mt-0.5 text-[11px] ${subText}`} numberOfLines={1}>
                    {place.address}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
