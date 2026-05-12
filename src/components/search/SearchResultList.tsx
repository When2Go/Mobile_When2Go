import { Pressable, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

interface Place {
  name: string;
  address: string;
}

const MOCK_PLACES: Place[] = [
  { name: '강남역 2호선', address: '서울 강남구 역삼동 825-8' },
  { name: '강남역 신분당선', address: '서울 강남구 역삼동 825-8' },
  { name: '강남구청', address: '서울 강남구 학동로 426' },
  { name: '강남터미널', address: '서울 서초구 신반포로 194' },
  { name: '강남대로', address: '서울 강남구 강남대로 396' },
  { name: '인하대역', address: '인천 미추홀구 인하로 100' },
  { name: '인하대학교', address: '인천 미추홀구 인하로 100' },
  { name: '홍대입구역', address: '서울 마포구 양화로 160' },
  { name: '서울역', address: '서울 용산구 한강대로 405' },
  { name: '부평역', address: '인천 부평구 부평대로 168' },
  { name: '용산역', address: '서울 용산구 한강대로 109' },
  { name: '스타벅스 주안역점', address: '인천 미추홀구 경인로 607' },
];

interface Props {
  query: string;
  onSelect: (name: string) => void;
}

export default function SearchResultList({ query, onSelect }: Props) {
  const { isDark } = useTheme();

  const lowerQuery = query.toLowerCase();
  const results = MOCK_PLACES.filter(
    (p) => p.name.toLowerCase().includes(lowerQuery) || p.address.toLowerCase().includes(lowerQuery),
  );

  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const label = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';

  return (
    <View>
      <Text className={`mb-3 text-xs font-semibold ${sub}`}>검색 결과</Text>
      {results.length === 0 ? (
        <View className="items-center py-12">
          <Text className={`text-sm ${sub}`}>{`"${query}" 검색 결과가 없습니다`}</Text>
        </View>
      ) : (
        results.map((item) => (
          <Pressable
            key={item.name}
            onPress={() => onSelect(item.name)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            className={`flex-row items-center gap-4 border-b py-3 active:opacity-60 ${divider}`}
          >
            <MapPin size={ICON_SIZE.header} color={isDark ? PALETTE.zinc500 : PALETTE.zinc400} />
            <View className="flex-1">
              <Text className={`text-[15px] font-medium ${label}`}>{item.name}</Text>
              <Text className={`text-xs ${sub}`}>{item.address}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}
