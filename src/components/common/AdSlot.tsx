import { Text, View } from 'react-native';

export type AdSlotType = 'banner' | 'splash' | 'interstitial';
/** 'dark'는 잠금화면/알림 위젯처럼 어두운 배경 위에 올라가는 placeholder. */
export type AdSlotTone = 'light' | 'dark';

interface AdSlotProps {
  type: AdSlotType;
  height?: number;
  tone?: AdSlotTone;
  className?: string;
}

const DEFAULT_HEIGHT: Record<AdSlotType, number> = {
  banner: 60,
  splash: 80,
  interstitial: 200,
};

const TYPE_LABEL: Record<AdSlotType, string> = {
  banner: '배너',
  splash: '스플래시',
  interstitial: '전면',
};

const TONE_STYLE: Record<AdSlotTone, { container: string; label: string; caption: string }> = {
  light: { container: 'bg-zinc-100', label: 'text-zinc-500', caption: 'text-zinc-400' },
  dark: { container: 'bg-white/5 border border-dashed border-white/20', label: 'text-zinc-400', caption: 'text-zinc-500' },
};

/**
 * 광고 영역 placeholder. 실 광고 SDK 호출은 금지(docs/FRONTEND.md §7).
 * 앱 심사 통과 후 별도 이슈에서 SDK 연동 예정.
 */
export default function AdSlot({ type, height, tone = 'light', className = '' }: AdSlotProps) {
  const resolvedHeight = height ?? DEFAULT_HEIGHT[type];
  const { container, label, caption } = TONE_STYLE[tone];

  return (
    <View
      style={{ height: resolvedHeight }}
      className={`w-full items-center justify-center rounded-xl ${container} ${className}`}
      accessibilityRole="none"
      accessibilityLabel={`광고 영역 (${TYPE_LABEL[type]})`}
    >
      <Text className={`text-sm font-semibold ${label}`}>광고 영역</Text>
      <Text className={`mt-0.5 text-[11px] font-medium ${caption}`}>{TYPE_LABEL[type]}</Text>
    </View>
  );
}
