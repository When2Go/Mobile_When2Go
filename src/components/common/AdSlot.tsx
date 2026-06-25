import { Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { ADS_ENABLED, getBannerUnitId } from '@/config/ads';

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
 * 광고 영역. 기본은 placeholder(docs/FRONTEND.md §7)이며, 앱 심사 통과 후
 * EXPO_PUBLIC_ADS_ENABLED=true 일 때만 실 BannerAd 를 렌더한다.
 * 전면(interstitial)은 배너가 아니므로 항상 placeholder 로 둔다.
 */
export default function AdSlot({ type, height, className = '' }: AdSlotProps) {
  const resolvedHeight = height ?? DEFAULT_HEIGHT[type];

  if (ADS_ENABLED && type !== 'interstitial') {
    return (
      <View
        style={{ height: resolvedHeight }}
        className={`w-full items-center justify-center overflow-hidden rounded-xl ${className}`}
        accessibilityRole="none"
        accessibilityLabel={`광고 (${TYPE_LABEL[type]})`}
      >
        <BannerAd unitId={getBannerUnitId(type)} size={BannerAdSize.BANNER} />
      </View>
    );
  }

  const containerBg = 'bg-zinc-100';
  const labelText = 'text-zinc-500';
  const captionText = 'text-zinc-400';

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
