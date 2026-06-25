import { Platform } from 'react-native';

/**
 * AdMob 광고 설정. 실 SDK 호출 분기와 광고 단위 ID 선택을 담당한다.
 *
 * 정책(CLAUDE.md §10 / docs/FRONTEND.md §7): 앱 심사 통과 전까지는
 * EXPO_PUBLIC_ADS_ENABLED=false 로 두어 AdSlot 이 placeholder 만 노출한다.
 * 실 광고 노출 활성화(=true)는 심사 통과 후 별도 PR.
 */

/** AdSlot 의 배너성 타입. interstitial(전면)은 현재 미사용이라 제외. */
export type AdBannerSlot = 'banner' | 'splash';

type AdPlatform = 'ios' | 'android';

type EnvLike = Record<string, string | undefined>;

/** Google 공개 테스트 배너 단위 ID. 실 단위 ID 미설정 시 fallback. */
export const TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

/** 슬롯 × 플랫폼 → 단위 ID 를 담은 env 키 이름. */
const UNIT_ID_ENV_KEY: Record<AdBannerSlot, Record<AdPlatform, string>> = {
  banner: {
    ios: 'EXPO_PUBLIC_ADMOB_IOS_CONTENT_BANNER_ID',
    android: 'EXPO_PUBLIC_ADMOB_ANDROID_CONTENT_BANNER_ID',
  },
  splash: {
    ios: 'EXPO_PUBLIC_ADMOB_IOS_SPLASH_BANNER_ID',
    android: 'EXPO_PUBLIC_ADMOB_ANDROID_SPLASH_BANNER_ID',
  },
};

/** 광고 노출 활성화 여부. 정확히 'true' 문자열일 때만 켠다. */
export function isAdsEnabled(env: EnvLike = process.env): boolean {
  return env.EXPO_PUBLIC_ADS_ENABLED === 'true';
}

/** 슬롯·플랫폼에 맞는 배너 단위 ID. env 미설정/빈값이면 테스트 ID 로 fallback. */
export function resolveBannerUnitId(
  slot: AdBannerSlot,
  platform: AdPlatform,
  env: EnvLike = process.env,
): string {
  return env[UNIT_ID_ENV_KEY[slot][platform]] || TEST_BANNER_UNIT_ID;
}

/** 현재 실행 플랫폼 기준 배너 단위 ID. */
export function getBannerUnitId(slot: AdBannerSlot): string {
  const platform: AdPlatform = Platform.OS === 'android' ? 'android' : 'ios';
  return resolveBannerUnitId(slot, platform);
}

/** 모듈 로드 시점의 활성화 플래그(컴포넌트에서 즉시 참조용). */
export const ADS_ENABLED = isAdsEnabled();
