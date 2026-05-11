import { Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export type AdSlotType = 'banner' | 'splash' | 'interstitial';

interface AdSlotProps {
  type: AdSlotType;
  height?: number;
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

/**
 * 광고 영역 placeholder. 실 광고 SDK 호출은 금지(docs/FRONTEND.md §7).
 * 앱 심사 통과 후 별도 이슈에서 SDK 연동 예정.
 */
export default function AdSlot({ type, height, className = '' }: AdSlotProps) {
  const { isDark } = useTheme();

  const resolvedHeight = height ?? DEFAULT_HEIGHT[type];
  const containerBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const labelText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const captionText = isDark ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <View
      style={{ height: resolvedHeight }}
      className={`w-full items-center justify-center rounded-xl ${containerBg} ${className}`}
      accessibilityRole="none"
      accessibilityLabel={`광고 영역 (${TYPE_LABEL[type]})`}
    >
      <Text className={`text-sm font-semibold ${labelText}`}>광고 영역</Text>
      <Text className={`mt-0.5 text-[11px] font-medium ${captionText}`}>{TYPE_LABEL[type]}</Text>
    </View>
  );
}
