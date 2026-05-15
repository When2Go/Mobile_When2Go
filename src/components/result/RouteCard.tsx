import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bus, ChevronRight, MapPin, TrainFront } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import {
  ARRIVAL_SUFFIX_FORMAT,
  BADGE_LABEL,
  DEPART_SUFFIX,
  TRANSFER_META_FORMAT,
  type MockRoute,
  type RouteBadgeId,
  type TransitIcon,
} from '@/constants/result';

const STEP_DOT_SIZE_CLASS = 'h-5 w-5';
const STEP_ICON_SIZE = 10;
const CHEVRON_SIZE = 12;

const BADGE_BG_CLASS: Record<RouteBadgeId, string> = {
  optimal: 'bg-blue-600',
  min_transfer: 'bg-emerald-600',
  min_fare: 'bg-amber-500',
};

interface RouteCardProps {
  route: MockRoute;
  onPress: () => void;
}

interface StepIconProps {
  index: number;
  total: number;
  icon: TransitIcon;
}

function resolveStepKind(index: number, total: number): 'start' | 'end' | 'middle' {
  if (index === 0) return 'start';
  if (index === total - 1) return 'end';
  return 'middle';
}

function StepIcon({ index, total, icon }: StepIconProps) {
  const { isDark } = useTheme();
  const kind = resolveStepKind(index, total);

  const dotBg = (() => {
    if (kind === 'start') return isDark ? 'bg-blue-900/60' : 'bg-blue-100';
    if (kind === 'end') return isDark ? 'bg-rose-900/60' : 'bg-rose-100';
    return isDark ? 'bg-emerald-900/40' : 'bg-emerald-100';
  })();

  const iconColor = (() => {
    if (kind === 'start') return isDark ? PALETTE.blue400 : PALETTE.blue600;
    if (kind === 'end') return isDark ? PALETTE.rose400 : PALETTE.rose600;
    return isDark ? PALETTE.emerald400 : PALETTE.emerald600;
  })();

  const renderInner = () => {
    if (kind === 'start' || kind === 'end') {
      return <MapPin size={STEP_ICON_SIZE} color={iconColor} />;
    }
    if (icon === 'train') {
      return <TrainFront size={STEP_ICON_SIZE} color={iconColor} />;
    }
    return <Bus size={STEP_ICON_SIZE} color={iconColor} />;
  };

  return (
    <View
      className={`items-center justify-center rounded-full ${STEP_DOT_SIZE_CLASS} ${dotBg}`}
    >
      {renderInner()}
    </View>
  );
}

export default function RouteCard({ route, onPress }: RouteCardProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? 'bg-zinc-800 border-zinc-700'
    : 'bg-white border-zinc-200';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const stepText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const chevronColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;

  const badgeBg = BADGE_BG_CLASS[route.badge];
  const badgeLabel = BADGE_LABEL[route.badge];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${badgeLabel} 경로 선택`}
      className={`rounded-2xl border p-4 active:opacity-70 ${cardClass}`}
    >
      {/* 상단: 배지 + 소요/환승 메타 */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className={`rounded-full px-2.5 py-1 ${badgeBg}`}>
          <Text className="text-[11px] font-bold text-white">{badgeLabel}</Text>
        </View>
        <Text className={`text-xs font-medium ${subText}`}>
          {TRANSFER_META_FORMAT(route.durationLabel, route.transferCount)}
        </Text>
      </View>

      {/* 중단: 출발 시각 강조 + 도착 보조 */}
      <View className="mb-3 flex-row items-baseline">
        <Text className="text-2xl font-black text-blue-500">{route.departureTime}</Text>
        <Text className={`ml-2 text-sm font-semibold ${subText}`}>{DEPART_SUFFIX}</Text>
        <View className="flex-1" />
        <Text className={`text-xs ${subText}`}>{ARRIVAL_SUFFIX_FORMAT(route.arrivalTime)}</Text>
      </View>

      {/* 하단: 스텝 체인 */}
      <View className="flex-row flex-wrap items-center">
        {route.steps.map((step, i) => (
          <Fragment key={`${route.id}-${step}-${i}`}>
            <View className="flex-row items-center">
              <StepIcon index={i} total={route.steps.length} icon={route.icon} />
              <Text
                className={`ml-1 text-xs font-medium ${stepText}`}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
            {i < route.steps.length - 1 ? (
              <View className="mx-1">
                <ChevronRight size={CHEVRON_SIZE} color={chevronColor} />
              </View>
            ) : null}
          </Fragment>
        ))}
      </View>
    </Pressable>
  );
}
