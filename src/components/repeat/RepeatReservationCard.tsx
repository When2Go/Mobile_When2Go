import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Clock, MapPin, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { DAYS } from '@/constants/repeat';
import type { RepeatItem } from '@/types/repeat.types';

const PAN_ACTIVATE_OFFSET = 10;
const SWIPE_REVEAL_THRESHOLD = -40;
const SWIPE_DELETE_THRESHOLD = -200;
const TAP_MAX_DISTANCE = 10;
const DELETE_BTN_WIDTH = 88;
const CARD_OFFSCREEN = 500;
const DELETE_ANIM_MS = 220;
const SETTLE_ANIM_MS = 200;
const DELETE_BTN_WIDTH_CLASS = 'w-[88px]';

const DAY_DOT_SIZE_CLASS = 'h-7 w-7';
const ARRIVAL_LABEL = '도착 시간';
/** 카드 내부 오른쪽 padding(16px=4) + 토글 컴포넌트 폭(w-12=48px)에 맞춘 절대 위치 오프셋. */
const TOGGLE_OFFSET_RIGHT_CLASS = 'right-4';
const TOGGLE_OFFSET_TOP_CLASS = 'top-4';

interface RepeatReservationCardProps {
  item: RepeatItem;
  onPress: (item: RepeatItem) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function formatArrival(period: string, hour: number, minute: number): string {
  return `${period} ${hour}:${String(minute).padStart(2, '0')}`;
}

function Toggle({ enabled, isDark }: { enabled: boolean; isDark: boolean }) {
  const trackBg = (() => {
    if (enabled) return 'bg-blue-600';
    return isDark ? 'bg-zinc-600' : 'bg-zinc-300';
  })();
  const thumbPosition = enabled ? 'translate-x-6' : 'translate-x-1';
  return (
    <View className={`relative h-7 w-12 justify-center rounded-full ${trackBg}`}>
      <View className={`h-5 w-5 rounded-full bg-white ${thumbPosition}`} />
    </View>
  );
}

export default function RepeatReservationCard({
  item,
  onPress,
  onToggle,
  onDelete,
}: RepeatReservationCardProps) {
  const { isDark } = useTheme();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const cardBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const heading = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const arrivalRowBg = isDark ? 'bg-zinc-900/50' : 'bg-zinc-50';
  const inactiveDot = isDark ? 'bg-zinc-700' : 'bg-zinc-100';
  const inactiveDotText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const cardOpacity = item.enabled ? '' : 'opacity-50';

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [onDelete, item.id]);

  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [onToggle, item.id]);

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

  const tap = Gesture.Tap()
    .maxDistance(TAP_MAX_DISTANCE)
    .onEnd((_e, success) => {
      if (success) runOnJS(handlePress)();
    });

  const composed = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="relative overflow-hidden rounded-2xl">
      {/* 스와이프 노출 시 삭제 버튼 */}
      <View
        className={`absolute inset-y-0 right-0 ${DELETE_BTN_WIDTH_CLASS} items-center justify-center rounded-r-2xl bg-red-500`}
      >
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} 반복 예약 삭제`}
          className="h-full w-full items-center justify-center gap-1 active:bg-red-600"
        >
          <Trash2 size={ICON_SIZE.header} color={PALETTE.white} />
          <Text className="text-[10px] font-bold text-white">삭제</Text>
        </Pressable>
      </View>

      <Animated.View style={animatedStyle} className="relative z-10">
        <GestureDetector gesture={composed}>
          <View className={`rounded-2xl border ${cardBg}`}>
            <View className={`p-4 ${cardOpacity}`}>
            {/* 상단: 이름 + 목적지 (토글은 절대 위치로 별도 오버레이) */}
            <View className="mb-3 pr-14">
              <Text className={`text-base font-bold ${heading}`}>{item.name}</Text>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <MapPin
                  size={ICON_SIZE.caption + 2}
                  color={isDark ? PALETTE.zinc400 : PALETTE.zinc500}
                />
                <Text className={`flex-1 text-sm ${sub}`} numberOfLines={1}>
                  {item.destination}
                </Text>
              </View>
            </View>

            {/* 요일 dot */}
            <View className="mb-3 flex-row gap-1.5">
              {DAYS.map((d, i) => {
                const active = item.days.includes(i);
                const dotBg = active ? 'bg-blue-600' : inactiveDot;
                const dotText = active ? 'text-white' : inactiveDotText;
                return (
                  <View
                    key={d}
                    className={`${DAY_DOT_SIZE_CLASS} items-center justify-center rounded-full ${dotBg}`}
                  >
                    <Text className={`text-xs font-bold ${dotText}`}>{d}</Text>
                  </View>
                );
              })}
            </View>

            {/* 도착 시간 박스 */}
            <View className={`flex-row items-center gap-2 rounded-xl px-3 py-2 ${arrivalRowBg}`}>
              <Clock size={ICON_SIZE.card} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
              <Text className={`text-xs font-semibold ${sub}`}>{ARRIVAL_LABEL}</Text>
              <Text className="ml-auto text-sm font-bold text-blue-500">
                {formatArrival(item.arrivalPeriod, item.arrivalHour, item.arrivalMinute)}
              </Text>
            </View>
            </View>
          </View>
        </GestureDetector>

        {/* 토글 — GestureDetector 바깥에 절대 위치로 띄워 탭이 새지 않게 */}
        <Pressable
          onPress={handleToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: item.enabled }}
          accessibilityLabel={`${item.name} 반복 예약 ${item.enabled ? '비활성화' : '활성화'}`}
          hitSlop={8}
          className={`absolute ${TOGGLE_OFFSET_RIGHT_CLASS} ${TOGGLE_OFFSET_TOP_CLASS} active:opacity-70`}
        >
          <Toggle enabled={item.enabled} isDark={isDark} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
