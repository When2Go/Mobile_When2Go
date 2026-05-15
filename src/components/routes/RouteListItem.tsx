import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MapPin, Pencil, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import type { RouteItem } from '@/types/routes.types';

const PAN_ACTIVATE_OFFSET = 10;
const SWIPE_REVEAL_THRESHOLD = -40;
const SWIPE_DELETE_THRESHOLD = -200;
const DELETE_BTN_WIDTH = 88;
const CARD_OFFSCREEN = 500;
const DELETE_ANIM_MS = 220;
const SETTLE_ANIM_MS = 200;
const ORIGIN_DOT_SIZE = 8;
const DELETE_BTN_WIDTH_CLASS = 'w-[88px]';

interface RouteListItemProps {
  route: RouteItem;
  onNavigateToSetup: (route: RouteItem) => void;
  onEdit: (route: RouteItem) => void;
  onDelete: (id: number) => void;
}

export default function RouteListItem({ route, onNavigateToSetup, onEdit, onDelete }: RouteListItemProps) {
  const { isDark } = useTheme();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const cardBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const divider = isDark ? 'border-zinc-700' : 'border-zinc-100';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const originDotColor = isDark ? 'bg-blue-400' : 'bg-blue-600';

  const handleDelete = useCallback(() => {
    onDelete(route.id);
  }, [onDelete, route.id]);

  const pan = Gesture.Pan()
    .activeOffsetX([-PAN_ACTIVATE_OFFSET, PAN_ACTIVATE_OFFSET])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX + startX.value);
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_DELETE_THRESHOLD) {
        translateX.value = withTiming(
          -CARD_OFFSCREEN,
          { duration: DELETE_ANIM_MS },
          (finished) => {
            if (finished) runOnJS(handleDelete)();
          },
        );
      } else if (e.translationX < SWIPE_REVEAL_THRESHOLD) {
        translateX.value = withTiming(-DELETE_BTN_WIDTH, { duration: SETTLE_ANIM_MS });
      } else {
        translateX.value = withTiming(0, { duration: SETTLE_ANIM_MS });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="relative overflow-hidden rounded-2xl">
      {/* 삭제 버튼 — 카드 슬라이드 시 노출 */}
      <View
        className={`absolute inset-y-0 right-0 ${DELETE_BTN_WIDTH_CLASS} items-center justify-center rounded-r-2xl bg-red-500`}
      >
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`${route.name} 경로 삭제`}
          className="h-full w-full items-center justify-center gap-1 active:bg-red-600"
        >
          <Trash2 size={ICON_SIZE.header} color={PALETTE.white} />
          <Text className="text-[10px] font-bold text-white">삭제</Text>
        </Pressable>
      </View>

      {/* 스와이프 가능한 카드 */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={animatedStyle}
          className={`relative z-10 rounded-2xl border p-4 ${cardBg}`}
        >
          {/* Title row */}
          <Pressable
            onPress={() => onNavigateToSetup(route)}
            accessibilityRole="button"
            accessibilityLabel={`${route.name} 경로로 설정`}
          >
            <View className="mb-3 flex-row items-start justify-between">
              <Text className={`text-base font-bold ${heading}`}>{route.name}</Text>
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
