import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, BellOff, Flag, Home, Smartphone, TrainFront, X, Zap } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import AdSlot from '@/components/common/AdSlot';
import { useSettingsStore } from '@/stores/settingsStore';
import CharacterProgressBar from './CharacterProgressBar';
import { WIDGET_MOCK } from './widgetMockData';

/** 잠금화면 mock 배경(보라→네이비 그라데이션). 디자인 시안의 월페이퍼 색이며 브랜드 토큰 아님. */
const LOCK_BG_GRADIENT = ['#1e1b4b', '#1f2937', '#0f172a'] as const;
const MOCK_HEIGHT = 560;
const WIDGET_AD_HEIGHT = 36;

/** iOS 잠금화면 하단 Live Activity 위젯 미리보기 (F-W01). */
export default function IOSLiveActivityPreview() {
  const widgetEnabled = useSettingsStore((s) => s.widgetEnabled);
  const setWidgetEnabled = useSettingsStore((s) => s.setWidgetEnabled);

  return (
    <View className="flex-col gap-4">
      <View className="flex-row items-center gap-2">
        <Smartphone size={ICON_SIZE.card} color={PALETTE.zinc400} />
        <Text className="text-xs font-semibold text-zinc-500">
          iOS Live Activity — 잠금화면 하단 위젯
        </Text>
      </View>

      <View
        style={{ minHeight: MOCK_HEIGHT }}
        className="relative w-full overflow-hidden rounded-3xl border border-zinc-700"
      >
        <LinearGradient
          colors={LOCK_BG_GRADIENT}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Dynamic Island pill (compact) */}
        <View className="absolute left-1/2 top-3 z-30 -translate-x-1/2">
          <View className="flex-row items-center gap-2 rounded-full bg-zinc-950 px-3 py-1.5">
            <View className="h-2 w-2 rounded-full bg-blue-400" />
            <Text className="text-[11px] font-bold text-white">지금 나가?</Text>
            <Text className="text-[11px] font-bold text-emerald-400">
              {WIDGET_MOCK.transitMinutes}분
            </Text>
          </View>
        </View>

        {/* 잠금화면 시계 + 푸시 알림 */}
        <View className="items-center px-6 pb-4 pt-16">
          <Text className="mt-2 text-sm font-medium text-zinc-400">{WIDGET_MOCK.lockDate}</Text>
          <Text className="mt-1 font-thin text-white" style={{ fontSize: 64, lineHeight: 70 }}>
            {WIDGET_MOCK.lockClock}
          </Text>

          <View className="mt-6 w-full">
            <View className="flex-row items-center gap-2 rounded-2xl border border-white/5 bg-white/10 px-4 py-2.5">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <Bell size={ICON_SIZE.card} color={PALETTE.white} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-white">지금 나가?</Text>
                <Text className="text-xs text-zinc-300">{WIDGET_MOCK.notiTitle}</Text>
              </View>
              <Text className="text-[10px] text-zinc-400">{WIDGET_MOCK.notiTime}</Text>
            </View>
          </View>
        </View>

        {/* Live Activity 위젯 (끄기/다시보기) */}
        <View className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          {widgetEnabled ? (
            <Animated.View
              entering={FadeInDown.springify().damping(24)}
              exiting={FadeOutDown}
              className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90"
            >
              <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-lg bg-blue-600">
                    <Zap size={ICON_SIZE.caption} color={PALETTE.white} />
                  </View>
                  <Text className="text-xs font-bold text-white">지금 나가?</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-[10px] text-zinc-400">
                    도착 {WIDGET_MOCK.arrivalTime} 예정
                  </Text>
                  <Pressable
                    onPress={() => setWidgetEnabled(false)}
                    accessibilityRole="button"
                    accessibilityLabel="위젯 끄기"
                    className="h-5 w-5 items-center justify-center rounded-full bg-white/10 active:opacity-60"
                  >
                    <X size={ICON_SIZE.caption} color={PALETTE.zinc400} />
                  </Pressable>
                </View>
              </View>

              {/* F-W04: LLM 메시지 */}
              <View className="mx-4 mb-3 rounded-xl border border-blue-500/20 bg-blue-600/20 px-3 py-2">
                <Text className="text-sm font-bold text-white">{WIDGET_MOCK.llmMessage}</Text>
                <Text className="mt-0.5 text-xs text-blue-300">{WIDGET_MOCK.llmSub}</Text>
              </View>

              {/* F-W03: 캐릭터 프로그레스 바 */}
              <View className="px-4 pb-3">
                <CharacterProgressBar progress={WIDGET_MOCK.progress} />
                <View className="mt-5 flex-row justify-between">
                  <View className="items-center gap-0.5">
                    <Home size={ICON_SIZE.caption} color={PALETTE.zinc400} />
                    <Text className="text-[10px] font-semibold text-zinc-400">출발지</Text>
                  </View>
                  <View className="items-center gap-0.5">
                    <TrainFront size={ICON_SIZE.caption} color={PALETTE.emerald400} />
                    <Text className="text-[10px] font-semibold text-emerald-400">
                      {WIDGET_MOCK.midStation}
                    </Text>
                  </View>
                  <View className="items-center gap-0.5">
                    <Flag size={ICON_SIZE.caption} color={PALETTE.zinc400} />
                    <Text className="text-[10px] font-semibold text-zinc-400">
                      {WIDGET_MOCK.destination}
                    </Text>
                  </View>
                </View>
              </View>

              {/* F-W05: 대중교통 예상 도착 */}
              <View className="px-4 pb-3">
                <View className="flex-row items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                      <TrainFront size={ICON_SIZE.card} color={PALETTE.emerald400} />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-white">{WIDGET_MOCK.transitName}</Text>
                      <Text className="text-[10px] text-zinc-400">{WIDGET_MOCK.transitStation}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-black text-emerald-400">
                      {WIDGET_MOCK.transitMinutes}분
                    </Text>
                    <Text className="text-[10px] text-zinc-400">
                      {WIDGET_MOCK.transitTime} 출발
                    </Text>
                  </View>
                </View>
              </View>

              {/* F-W07: 하단 광고 배너 */}
              <View className="px-4 pb-3">
                <AdSlot type="banner" tone="dark" height={WIDGET_AD_HEIGHT} />
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn}>
              <Pressable
                onPress={() => setWidgetEnabled(true)}
                accessibilityRole="button"
                accessibilityLabel="위젯 다시 보기"
                className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 py-3 active:opacity-60"
              >
                <BellOff size={ICON_SIZE.card} color={PALETTE.zinc400} />
                <Text className="text-sm font-semibold text-zinc-300">위젯 다시 보기</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}
