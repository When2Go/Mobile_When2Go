import { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MapPin, Pencil, Star, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import type { RouteItem } from '@/types/routes.types';

const DELETE_BTN_WIDTH = 80;
const ORIGIN_DOT_SIZE = 8;

interface RouteListItemProps {
  route: RouteItem;
  onEdit: (route: RouteItem) => void;
  onDelete: (id: number) => void;
}

export default function RouteListItem({ route, onEdit, onDelete }: RouteListItemProps) {
  const { isDark } = useTheme();
  const swipeRef = useRef<Swipeable>(null);

  const cardBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const originDotColor = isDark ? 'bg-blue-400' : 'bg-blue-600';

  const handleDelete = () => {
    swipeRef.current?.close();
    onDelete(route.id);
  };

  const renderRightActions = (_: unknown, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-DELETE_BTN_WIDTH, 0],
      outputRange: [1, 0.8],
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

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={() => onEdit(route)}
        accessibilityRole="button"
        className={`rounded-2xl border p-4 active:opacity-80 ${cardBg}`}
      >
        {/* Title row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center gap-2">
            <Text className={`text-base font-bold ${heading}`}>{route.name}</Text>
            {route.isFavorite && (
              <Star size={ICON_SIZE.card} color={PALETTE.amber500} fill={PALETTE.amber500} />
            )}
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
