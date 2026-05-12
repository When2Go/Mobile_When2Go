import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

interface RecentDestination {
  id: string;
  name: string;
  subtitle: string;
  visitedAtLabel: string;
}

const RECENT_DESTINATIONS: RecentDestination[] = [
  { id: 'rec-1', name: '강남역 2호선', subtitle: '서울 강남구 강남대로', visitedAtLabel: '오늘 오전' },
  { id: 'rec-2', name: '인하대 정문', subtitle: '인천 미추홀구 인하로', visitedAtLabel: '어제' },
  { id: 'rec-3', name: '신논현역 카페', subtitle: '서울 강남구 봉은사로', visitedAtLabel: '3일 전' },
  { id: 'rec-4', name: '서울역 KTX', subtitle: '서울 용산구 한강대로', visitedAtLabel: '지난주' },
  { id: 'rec-5', name: '판교 테크노밸리', subtitle: '경기 성남시 분당구', visitedAtLabel: '2주 전' },
];

export default function RecentDestinations() {
  const router = useRouter();
  const { isDark } = useTheme();

  const sectionTitle = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const rowBorder = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const timeText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const iconBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const pinColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const clockColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between px-5">
        <Text className={`text-sm font-bold ${sectionTitle}`}>최근 목적지</Text>
      </View>

      <View className="px-5">
        {RECENT_DESTINATIONS.map((item, index) => {
          const isLast = index === RECENT_DESTINATIONS.length - 1;
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push('/setup')}
              accessibilityRole="button"
              accessibilityLabel={`${item.name} 목적지로 출발 시간 설정`}
              className={`flex-row items-center gap-3 py-3 active:opacity-70 ${isLast ? '' : `border-b ${rowBorder}`}`}
            >
              <View className={`h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                <MapPin size={ICON_SIZE.card} color={pinColor} />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-semibold ${labelText}`} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className={`mt-0.5 text-[11px] ${subText}`} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={ICON_SIZE.caption} color={clockColor} />
                <Text className={`text-[11px] ${timeText}`}>{item.visitedAtLabel}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
