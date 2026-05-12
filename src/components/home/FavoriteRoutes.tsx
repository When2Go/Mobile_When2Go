import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, GraduationCap, Heart, Home as HomeIcon, MapPin } from 'lucide-react-native';
import type { ComponentType } from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

type FavoriteIconKind = 'home' | 'work' | 'school' | 'love';

interface FavoriteRoute {
  id: string;
  label: string;
  destination: string;
  averageMinutes: number;
  icon: FavoriteIconKind;
}

const FAVORITE_ROUTES: FavoriteRoute[] = [
  { id: 'fav-1', label: '집', destination: '인천 미추홀구 용현동', averageMinutes: 0, icon: 'home' },
  { id: 'fav-2', label: '회사', destination: '강남역 2호선', averageMinutes: 62, icon: 'work' },
  { id: 'fav-3', label: '학교', destination: '인하대 정문', averageMinutes: 18, icon: 'school' },
  { id: 'fav-4', label: '약속 장소', destination: '신논현역 카페', averageMinutes: 70, icon: 'love' },
];

const ICON_MAP: Record<FavoriteIconKind, ComponentType<{ size?: number; color?: string }>> = {
  home: HomeIcon,
  work: Briefcase,
  school: GraduationCap,
  love: Heart,
};

const CARD_WIDTH = 140;
const CARD_GAP = 12;

export default function FavoriteRoutes() {
  const router = useRouter();
  const { isDark } = useTheme();

  const sectionTitle = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const card = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200';
  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const destText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const metaText = isDark ? 'text-blue-400' : 'text-blue-500';
  const iconBg = isDark ? 'bg-blue-900/40' : 'bg-blue-50';
  const iconColor = isDark ? PALETTE.blue400 : PALETTE.blue500;
  const pinColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text className={`text-sm font-bold ${sectionTitle}`}>자주 가는 곳</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: CARD_GAP }}
      >
        {FAVORITE_ROUTES.map((route) => {
          const Icon = ICON_MAP[route.icon];
          return (
            <Pressable
              key={route.id}
              onPress={() => router.push('/setup')}
              accessibilityRole="button"
              accessibilityLabel={`${route.label} 목적지로 출발 시간 설정`}
              style={{ width: CARD_WIDTH }}
              className={`rounded-2xl border p-3 active:opacity-70 ${card}`}
            >
              <View className={`mb-2 h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                <Icon size={ICON_SIZE.card} color={iconColor} />
              </View>
              <Text className={`text-sm font-bold ${labelText}`} numberOfLines={1}>
                {route.label}
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <MapPin size={ICON_SIZE.caption} color={pinColor} />
                <Text className={`flex-1 text-[11px] ${destText}`} numberOfLines={1}>
                  {route.destination}
                </Text>
              </View>
              {route.averageMinutes > 0 && (
                <Text className={`mt-2 text-[11px] font-bold ${metaText}`}>
                  평균 {route.averageMinutes}분
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
