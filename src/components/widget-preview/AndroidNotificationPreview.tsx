import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Smartphone, TrainFront, X, Zap } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import AdSlot from '@/components/common/AdSlot';
import { useSettingsStore } from '@/stores/settingsStore';
import CharacterProgressBar from './CharacterProgressBar';
import { WIDGET_MOCK } from './widgetMockData';

/** Android 상태바 mock 배경(다크 그레이 그라데이션). 디자인 시안 색이며 브랜드 토큰 아님. */
const SHEET_BG_GRADIENT = ['#1c1c1e', '#2c2c2e'] as const;
const WIDGET_AD_HEIGHT = 36;

/** Android Ongoing Notification + 위젯 미리보기 (F-W02). */
export default function AndroidNotificationPreview() {
  const widgetEnabled = useSettingsStore((s) => s.widgetEnabled);
  const setWidgetEnabled = useSettingsStore((s) => s.setWidgetEnabled);

  return (
    <View className="flex-col gap-4">
      <View className="flex-row items-center gap-2">
        <Smartphone size={ICON_SIZE.card} color={PALETTE.zinc400} />
        <Text className="text-xs font-semibold text-zinc-500">
          Android — Ongoing Notification + 위젯
        </Text>
      </View>

      <View className="overflow-hidden rounded-3xl border border-zinc-700">
        <LinearGradient colors={SHEET_BG_GRADIENT} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}>
          <View className="flex-row items-center justify-between bg-black/30 px-5 py-2">
            <Text className="text-xs font-semibold text-white">{WIDGET_MOCK.lockClock}</Text>
            <Text className="text-[10px] text-zinc-400">●●●</Text>
          </View>

          <View className="gap-2 px-3 py-3">
            <Text className="mb-1 px-1 text-[10px] font-bold text-zinc-400">알림</Text>

            {widgetEnabled ? (
              <Animated.View
                entering={FadeIn}
                className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800"
              >
                <View className="flex-row items-center justify-between px-4 pb-1 pt-3">
                  <View className="flex-row items-center gap-2">
                    <View className="h-5 w-5 items-center justify-center rounded-md bg-blue-600">
                      <Zap size={ICON_SIZE.caption} color={PALETTE.white} />
                    </View>
                    <Text className="text-[11px] font-bold text-white">지금 나가?</Text>
                    <Text className="text-[10px] text-zinc-500">· 지금</Text>
                  </View>
                  <Pressable
                    onPress={() => setWidgetEnabled(false)}
                    accessibilityRole="button"
                    accessibilityLabel="알림 닫기"
                    className="h-5 w-5 items-center justify-center rounded-full active:opacity-60"
                  >
                    <X size={ICON_SIZE.caption} color={PALETTE.zinc400} />
                  </Pressable>
                </View>

                {/* F-W04: LLM 메시지 */}
                <View className="px-4 pb-1">
                  <Text className="text-sm font-bold text-white">{WIDGET_MOCK.llmMessage}</Text>
                  <Text className="text-xs text-zinc-400">{WIDGET_MOCK.llmSub}</Text>
                </View>

                {/* F-W03: 캐릭터 프로그레스 바 */}
                <View className="px-4 py-3">
                  <CharacterProgressBar progress={WIDGET_MOCK.progress} runnerOffsetClass="-top-4" />
                  <View className="mt-5 flex-row justify-between">
                    <Text className="text-[10px] font-medium text-zinc-500">출발지</Text>
                    <Text className="text-[10px] font-medium text-emerald-400">
                      {WIDGET_MOCK.midStation}
                    </Text>
                    <Text className="text-[10px] font-medium text-zinc-500">
                      {WIDGET_MOCK.destination}
                    </Text>
                  </View>
                </View>

                {/* F-W05: 대중교통 예상 도착 */}
                <View className="mx-4 mb-3 flex-row items-center justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2">
                  <View className="flex-row items-center gap-2">
                    <TrainFront size={ICON_SIZE.card} color={PALETTE.emerald400} />
                    <View>
                      <Text className="text-[11px] font-bold text-white">
                        {WIDGET_MOCK.transitName}
                      </Text>
                      <Text className="text-[10px] text-zinc-400">{WIDGET_MOCK.transitStation}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-black text-emerald-400">
                      {WIDGET_MOCK.transitMinutes}분
                    </Text>
                    <Text className="text-[10px] text-zinc-500">{WIDGET_MOCK.transitTime}</Text>
                  </View>
                </View>

                {/* 액션 버튼 */}
                <View className="flex-row border-t border-zinc-700">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="경로 보기"
                    className="flex-1 border-r border-zinc-700 py-2.5 active:opacity-60"
                  >
                    <Text className="text-center text-[11px] font-bold text-blue-400">경로 보기</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setWidgetEnabled(false)}
                    accessibilityRole="button"
                    accessibilityLabel="위젯 끄기"
                    className="flex-1 py-2.5 active:opacity-60"
                  >
                    <Text className="text-center text-[11px] font-bold text-zinc-400">위젯 끄기</Text>
                  </Pressable>
                </View>

                {/* F-W07: 하단 광고 배너 */}
                <View className="px-4 pb-3 pt-1">
                  <AdSlot type="banner" tone="dark" height={WIDGET_AD_HEIGHT} />
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn}>
                <Pressable
                  onPress={() => setWidgetEnabled(true)}
                  accessibilityRole="button"
                  accessibilityLabel="알림 다시 보기"
                  className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 py-3 active:opacity-60"
                >
                  <Bell size={ICON_SIZE.card} color={PALETTE.zinc400} />
                  <Text className="text-sm font-semibold text-zinc-400">알림 다시 보기</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* 비활성 더미 알림 (시안의 분위기용) */}
            <View className="flex-row items-center gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 opacity-30">
              <Bell size={ICON_SIZE.card} color={PALETTE.zinc400} />
              <Text className="text-xs text-zinc-400">카카오톡 메시지 3개</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
