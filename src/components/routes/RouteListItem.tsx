import { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MapPin, Pencil, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import type { RouteItem } from '@/types/routes.types';

const DELETE_BTN_WIDTH = 80;
const FULL_SWIPE_THRESHOLD = 260;
const ORIGIN_DOT_SIZE = 8;

interface RouteListItemProps {
  route: RouteItem;
  onNavigateToSetup: (route: RouteItem) => void;
  onEdit: (route: RouteItem) => void;
  onDelete: (id: number) => void;
}

export default function RouteListItem({ route, onNavigateToSetup, onEdit, onDelete }: RouteListItemProps) {
  const { isDark } = useTheme();
  const swipeRef = useRef<Swipeable>(null);
  const maxDragRef = useRef(0);

  const cardBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const originDotColor = isDark ? 'bg-blue-400' : 'bg-blue-600';

  const handleDelete = () => {
    swipeRef.current?.close();
    onDelete(route.id);
  };

  const renderRightActions = (
    _: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    dragX.addListener(({ value }) => {
      const dist = -value;
      if (dist > maxDragRef.current) maxDragRef.current = dist;
    });

    // 임계값 초과 시 버튼이 살짝 커져 "놓으면 삭제됩니다" 시각적 피드백
    const scale = dragX.interpolate({
      inputRange: [-FULL_SWIPE_THRESHOLD, -DELETE_BTN_WIDTH, 0],
      outputRange: [1.15, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="삭제"
          className="h-full w-20 items-center justify-center rounded-2xl bg-red-500 active:bg-red-600"
        >
          <Trash2 size={ICON_SIZE.header} color={PALETTE.white} />
          <Text className="mt-1 text-xs font-semibold text-white">삭제</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    const wasFullSwipe = maxDragRef.current >= FULL_SWIPE_THRESHOLD;
    maxDragRef.current = 0;
    if (direction === 'right' && wasFullSwipe) {
      handleDelete();
    }
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      onSwipeableClose={() => { maxDragRef.current = 0; }}
    >
      <Pressable
        onPress={() => onNavigateToSetup(route)}
        accessibilityRole="button"
        accessibilityLabel={`${route.name} 경로로 설정`}
        className={`rounded-2xl border p-4 active:opacity-80 ${cardBg}`}
      >
        {/* Title row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center gap-2">
            <Text className={`text-base font-bold ${heading}`}>{route.name}</Text>
          </View>
          <Pressable
            onPress={() => onEdit(route)}
            accessibilityRole="button"
            accessibilityLabel="편집"
            hitSlop={8}
            className="rounded-lg p-1.5 active:opacity-60"
          >
            <Pencil size={ICON_SIZE.card} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
          </Pressable>
        </View>

        {/* Route row */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <View
              className={`rounded-full ${originDotColor}`}
              style={{ width: ORIGIN_DOT_SIZE, height: ORIGIN_DOT_SIZE }}
            />
            <Text className={`text-sm ${sub}`}>{route.from}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MapPin
              size={ICON_SIZE.caption + 2}
              color={isDark ? PALETTE.emerald100 : PALETTE.emerald700}
            />
            <Text className={`text-sm ${sub}`}>{route.to}</Text>
          </View>
        </View>

        {/* Footer */}
        <View className={`mt-3 flex-row items-center border-t pt-3 ${divider}`}>
          <Text className={`text-xs ${sub}`}>{route.frequency}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}
