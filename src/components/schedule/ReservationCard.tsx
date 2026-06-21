import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Bell, ChevronRight, Clock, MapPin, TrainFront, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import {
  CARD_OFFSCREEN,
  DELETE_ANIM_MS,
  DELETE_BTN_WIDTH,
  SETTLE_ANIM_MS,
  SWIPE_ACTIVATE_X,
  SWIPE_DELETE_THRESHOLD,
  SWIPE_REVEAL_THRESHOLD,
} from '@/constants/schedule';
import type { ScheduleItem } from '@/types/schedule.types';
import { useActiveTripStore } from '@/stores/activeTripStore';

const PAN_ACTIVATE_OFFSET = 10;
const DELETE_BTN_WIDTH_CLASS = 'w-[88px]';
const DEPART_BTN_LABEL = '출발하기';
const HOME_PATH = '/';

interface ReservationCardProps {
  schedule: ScheduleItem;
  onDelete: () => void;
  onTap: () => void;
}

/**
 * 좌측 스와이프 삭제 가능한 예약 카드.
 * - 시안의 motion.div drag → Reanimated `useSharedValue` + `Gesture.Pan()`로 매핑.
 * - 시안의 wasDragging 패턴은 `Gesture.Race(pan, tap)`로 대체.
 */
export default function ReservationCard({ schedule, onDelete, onTap }: ReservationCardProps) {
  const router = useRouter();
  const setActiveTrip = useActiveTripStore((s) => s.setActiveTrip);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleTap = useCallback(() => {
    onTap();
  }, [onTap]);

  const handleDepart = useCallback(() => {
    if (!schedule.encodedPolyline) return;
    setActiveTrip(schedule.encodedPolyline, schedule.boardingCoord ?? null);
    router.push(HOME_PATH);
  }, [schedule.encodedPolyline, schedule.boardingCoord, setActiveTrip, router]);

  const pan = Gesture.Pan()
    .activeOffsetX([-PAN_ACTIVATE_OFFSET, PAN_ACTIVATE_OFFSET])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = e.translationX + startX.value;
      translateX.value = Math.min(0, next);
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_DELETE_THRESHOLD) {
        translateX.value = withTiming(
          -CARD_OFFSCREEN,
          { duration: DELETE_ANIM_MS },
          (finished) => {
            if (finished) {
              runOnJS(handleDelete)();
            }
          },
        );
      } else if (e.translationX < SWIPE_REVEAL_THRESHOLD) {
        translateX.value = withTiming(-DELETE_BTN_WIDTH, { duration: SETTLE_ANIM_MS });
      } else {
        translateX.value = withTiming(0, { duration: SETTLE_ANIM_MS });
      }
    });

  const tap = Gesture.Tap()
    .maxDistance(SWIPE_ACTIVATE_X)
    .onEnd((_e, success) => {
      if (success) {
        runOnJS(handleTap)();
      }
    });

  const composed = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelText = 'text-zinc-900';
  const subText = 'text-zinc-500';
  const subIconColor = PALETTE.zinc500;
  const updatedText = 'text-zinc-400';

  const cardSurfaceClass = (() => {
    if (schedule.isActive) {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-white border-zinc-200';
  })();

  const statusBadgeClass = (() => {
    if (schedule.status === '확정') {
      return 'bg-blue-600';
    }
    if (schedule.status === '완료') {
      return 'bg-emerald-100';
    }
    return 'bg-zinc-100';
  })();

  const statusBadgeText = (() => {
    if (schedule.status === '확정') return 'text-white';
    if (schedule.status === '완료') {
      return 'text-emerald-700';
    }
    return 'text-zinc-500';
  })();

  const timeBoxBg = 'bg-zinc-50';
  const departureValueText = 'text-blue-500';

  return (
    <View className="relative overflow-hidden rounded-2xl">
      {/* 스와이프 시 노출되는 삭제 배경 */}
      <View
        className={`absolute inset-y-0 right-0 ${DELETE_BTN_WIDTH_CLASS} items-center justify-center rounded-r-2xl bg-red-500`}
      >
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`${schedule.title} 일정 삭제`}
          className="h-full w-full items-center justify-center gap-1 active:bg-red-600"
        >
          <Trash2 size={ICON_SIZE.header} color={PALETTE.white} />
          <Text className="text-[10px] font-bold text-white">삭제</Text>
        </Pressable>
      </View>

      {/* 스와이프 가능한 본 카드 */}
      <GestureDetector gesture={composed}>
        <Animated.View
          style={animatedStyle}
          className={`relative z-10 rounded-2xl border p-4 ${cardSurfaceClass}`}
        >
          {/* 제목 & 상태 */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              <View className="mb-1 flex-row items-baseline gap-2">
                <Text className={`text-base font-bold ${labelText}`}>{schedule.title}</Text>
                {schedule.updatedAt ? (
                  <Text className={`text-[11px] ${updatedText}`}>
                    {schedule.updatedAt}에 갱신됨
                  </Text>
                ) : null}
              </View>
              <View className="flex-row items-center gap-2">
                <MapPin size={ICON_SIZE.caption} color={subIconColor} />
                <Text className={`text-sm ${subText}`}>{schedule.destination}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2 shrink-0">
              {schedule.encodedPolyline ? (
                <Pressable
                  onPress={handleDepart}
                  accessibilityRole="button"
                  accessibilityLabel={DEPART_BTN_LABEL}
                  className="rounded-full bg-blue-600 px-2.5 py-1 active:opacity-70"
                >
                  <Text className="text-[10px] font-bold text-white">{DEPART_BTN_LABEL}</Text>
                </Pressable>
              ) : null}
              <View className={`shrink-0 rounded-full px-2 py-1 ${statusBadgeClass}`}>
                <Text className={`text-[10px] font-bold ${statusBadgeText}`}>
                  {schedule.status}
                </Text>
              </View>
            </View>
          </View>

          {/* 시간 정보 */}
          <View className={`mb-3 rounded-xl p-3 ${timeBoxBg}`}>
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Clock size={ICON_SIZE.card} color={subIconColor} />
                <Text className={`text-xs font-semibold ${subText}`}>도착 시간</Text>
              </View>
              <Text className={`text-sm font-bold ${labelText}`}>{schedule.arrivalTime}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Bell size={ICON_SIZE.card} color={subIconColor} />
                <Text className={`text-xs font-semibold ${subText}`}>출발 시간</Text>
              </View>
              <Text className={`text-sm font-bold ${departureValueText}`}>
                {schedule.departureTime}
              </Text>
            </View>
          </View>

          {/* 경로 */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-2 pr-2">
              <TrainFront size={ICON_SIZE.card} color={subIconColor} />
              <Text className={`flex-1 text-xs ${subText}`} numberOfLines={1}>
                {schedule.route}
              </Text>
            </View>
            <ChevronRight size={ICON_SIZE.card} color={subIconColor} />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
