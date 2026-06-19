import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Smartphone, TrainFront, Zap } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { RUNNER_EMOJI, WIDGET_MOCK } from './widgetMockData';

const COMPACT_WIDTH = 160;
const EXPANDED_WIDTH = 280;
const ANIM_DURATION_MS = 280;
const FILL_COLORS = [PALETTE.blue500, PALETTE.blue400] as const;
const PROGRESS_TRACK_WIDTH = EXPANDED_WIDTH - 32;
const RUNNER_BOX = 16;

/** iOS Dynamic Island 컴팩트 ↔ 확장 인터랙션 미리보기 (F-W01). */
export default function DynamicIslandPreview() {
  const [expanded, setExpanded] = useState(false);
  const width = useSharedValue(COMPACT_WIDTH);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    width.value = withTiming(next ? EXPANDED_WIDTH : COMPACT_WIDTH, {
      duration: ANIM_DURATION_MS,
    });
  };

  const pillStyle = useAnimatedStyle(() => ({ width: width.value }));
  const fillWidth = WIDGET_MOCK.progress * PROGRESS_TRACK_WIDTH;

  return (
    <View className="flex-col gap-5">
      <View className="flex-row items-center gap-2">
        <Smartphone size={ICON_SIZE.card} color={PALETTE.zinc400} />
        <Text className="text-xs font-semibold text-zinc-500">
          iOS Dynamic Island — 상단 인터랙션
        </Text>
      </View>

      <View className="overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-950 px-6 py-8">
        <Text className="mb-6 text-center text-xs text-zinc-500">
          Dynamic Island을 탭하여 확장/축소
        </Text>

        <View className="items-center">
          <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel="Dynamic Island 확장/축소">
            <Animated.View
              style={pillStyle}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-3 py-1.5"
            >
              {!expanded ? (
                <Animated.View
                  entering={FadeIn}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <View className="h-5 w-5 items-center justify-center rounded-md bg-blue-600">
                      <Zap size={ICON_SIZE.caption} color={PALETTE.white} />
                    </View>
                    <Text className="text-xs font-bold text-white">지금 나가?</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <Text className="text-xs font-black text-emerald-400">
                      {WIDGET_MOCK.transitMinutes}분
                    </Text>
                  </View>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeIn} className="w-full gap-3 px-1 py-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="h-7 w-7 items-center justify-center rounded-xl bg-blue-600">
                        <Zap size={ICON_SIZE.card} color={PALETTE.white} />
                      </View>
                      <View>
                        <Text className="text-xs font-black text-white">지금 나가?</Text>
                        <Text className="text-[10px] text-zinc-400">
                          {WIDGET_MOCK.destination} {WIDGET_MOCK.arrivalTime} 도착
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-xl font-black text-emerald-400">
                        {WIDGET_MOCK.transitMinutes}분
                      </Text>
                      <Text className="text-[10px] text-zinc-400">탑승까지</Text>
                    </View>
                  </View>

                  <View className="relative h-1 w-full rounded-full bg-white/15">
                    <View
                      style={{ width: fillWidth }}
                      className="absolute left-0 top-0 h-full overflow-hidden rounded-full"
                    >
                      <LinearGradient
                        colors={FILL_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: PROGRESS_TRACK_WIDTH, height: '100%' }}
                      />
                    </View>
                    <Text
                      style={{ transform: [{ translateX: fillWidth - RUNNER_BOX / 2 }] }}
                      className="absolute -top-2.5 left-0 text-sm leading-none"
                    >
                      {RUNNER_EMOJI}
                    </Text>
                  </View>

                  <Text className="text-[11px] font-semibold text-blue-300">
                    {WIDGET_MOCK.llmMessage}
                  </Text>

                  <View className="flex-row items-center justify-between rounded-xl bg-white/10 px-3 py-1.5">
                    <View className="flex-row items-center gap-1.5">
                      <TrainFront size={ICON_SIZE.caption} color={PALETTE.emerald400} />
                      <Text className="text-[11px] font-bold text-white">
                        {WIDGET_MOCK.transitName}
                      </Text>
                    </View>
                    <Text className="text-[11px] font-black text-emerald-400">
                      {WIDGET_MOCK.transitTime}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </Pressable>
        </View>

        <Text className="mt-6 text-center text-[11px] text-zinc-600">
          {expanded ? '탭하여 축소' : '탭하여 확장'}
        </Text>
      </View>

      <View className="gap-2">
        <View className="rounded-2xl border border-zinc-200 bg-white p-4">
          <Text className="mb-1 text-xs font-bold text-zinc-700">📍 컴팩트 상태 (Compact)</Text>
          <Text className="text-xs text-zinc-500">
            앱 이름 + 탑승까지 남은 시간을 pill 형태로 상시 노출합니다.
          </Text>
        </View>
        <View className="rounded-2xl border border-zinc-200 bg-white p-4">
          <Text className="mb-1 text-xs font-bold text-zinc-700">📐 확장 상태 (Expanded)</Text>
          <Text className="text-xs text-zinc-500">
            탭 시 확장 — 캐릭터 프로그레스 바, LLM 안내 메시지, 대중교통 탑승 시각을 표시합니다.
          </Text>
        </View>
      </View>
    </View>
  );
}
