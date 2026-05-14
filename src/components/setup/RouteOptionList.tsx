import { Pressable, Text, View } from 'react-native';
import { Settings2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { ROUTE_OPTIONS, ROUTE_SECTION_TITLE, type RouteOptionId } from '@/constants/setup';

interface Props {
  value: RouteOptionId;
  onChange: (id: RouteOptionId) => void;
}

/**
 * 경로 옵션 카드 그리드.
 * - 3개 카드(지하철+버스 / 지하철만 / 버스만) 중 단일 선택.
 * - 활성 카드는 blue ring + blue 배경 톤.
 */
export default function RouteOptionList({ value, onChange }: Props) {
  const { isDark } = useTheme();

  const labelText = isDark ? 'text-zinc-300' : 'text-zinc-800';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;

  const activeBorder = isDark ? 'border-blue-500' : 'border-blue-600';
  const activeBg = isDark ? 'bg-blue-900/30' : 'bg-blue-50/60';
  const activeText = isDark ? 'text-blue-300' : 'text-blue-700';

  const inactiveBorder = isDark ? 'border-zinc-700' : 'border-zinc-200';
  const inactiveBg = isDark ? 'bg-zinc-800' : 'bg-white';
  const inactiveText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <View className="px-5 py-6">
      <View className="mb-4 flex-row items-center gap-2">
        <Settings2 size={ICON_SIZE.card} color={subIconColor} />
        <Text className={`text-sm font-semibold ${labelText}`}>{ROUTE_SECTION_TITLE}</Text>
      </View>

      <View className="flex-row gap-3">
        {ROUTE_OPTIONS.map((opt) => {
          const isActive = value === opt.id;
          // 활성·비활성 모두 border-2로 두께를 고정해 1px 레이아웃 시프트 방지(#33 리뷰).
          const borderClass = `border-2 ${isActive ? activeBorder : inactiveBorder}`;
          const bgClass = isActive ? activeBg : inactiveBg;
          const textClass = isActive ? activeText : inactiveText;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              className={`flex-1 items-center justify-center rounded-xl p-4 active:opacity-80 ${borderClass} ${bgClass}`}
            >
              <Text className={`text-sm font-medium ${textClass}`}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
