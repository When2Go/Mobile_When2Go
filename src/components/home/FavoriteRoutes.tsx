import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Star } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { useRouteStore } from '@/stores/routeStore';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import type { RouteItem } from '@/types/routes.types';

const CARD_WIDTH = 140;
const CARD_GAP = 12;

export default function FavoriteRoutes() {
  const router = useRouter();
  // 셀렉터에서 filter 하면 매 렌더마다 새 배열이라 무한 루프. 안정적인 routes를 구독하고 파생한다.
  const routes = useRouteStore((s) => s.routes);
  const favorites = useMemo(() => routes.filter((r) => r.isFavorite), [routes]);

  const sectionTitle = 'text-zinc-800';
  const card = 'bg-zinc-50 border-zinc-200';
  const labelText = 'text-zinc-900';
  const destText = 'text-zinc-500';
  const iconBg = 'bg-amber-50';
  const iconColor = PALETTE.amber500;
  const pinColor = PALETTE.zinc400;
  const emptyText = 'text-zinc-400';

  // 저장된 목적지 좌표를 draft 스토어에 주입 → setup 진입 시 재검색 없이 재사용
  const handlePress = (route: RouteItem) => {
    const draft = useRouteDraftStore.getState();
    if (route.toCoords) draft.setCoords('to', route.toCoords);
    draft.setToName(route.to);
    router.push({ pathname: '/setup', params: { destination: route.to } });
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text className={`text-sm font-bold ${sectionTitle}`}>자주 가는 곳</Text>
      </View>

      {favorites.length === 0 ? (
        <View className="px-5">
          <Text className={`text-xs ${emptyText}`}>
            경로 관리에서 별을 누르면 자주 가는 곳에 표시됩니다
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: CARD_GAP }}
        >
          {favorites.map((route) => (
            <Pressable
              key={route.id}
              onPress={() => handlePress(route)}
              accessibilityRole="button"
              accessibilityLabel={`${route.name} 목적지로 출발 시간 설정`}
              style={{ width: CARD_WIDTH }}
              className={`rounded-2xl border p-3 active:opacity-70 ${card}`}
            >
              <View className={`mb-2 h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                <Star size={ICON_SIZE.card} color={iconColor} fill={iconColor} />
              </View>
              <Text className={`text-sm font-bold ${labelText}`} numberOfLines={1}>
                {route.name}
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <MapPin size={ICON_SIZE.caption} color={pinColor} />
                <Text className={`flex-1 text-[11px] ${destText}`} numberOfLines={1}>
                  {route.to}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
