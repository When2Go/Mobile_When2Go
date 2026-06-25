import { useEffect } from 'react';

import { ADS_ENABLED } from '@/config/ads';

/**
 * 광고 SDK 부트스트랩 훅. ADS_ENABLED(=심사 통과 후 활성화) 일 때만
 * iOS ATT(추적 투명성) 동의를 먼저 받고 Google Mobile Ads SDK 를 1회 초기화한다.
 * 비활성 상태(기본)에서는 아무 동작도 하지 않아 placeholder 정책을 유지한다.
 *
 * 광고 네이티브 모듈은 useEffect 내부에서 지연 로드한다. top-level import 하면
 * ADS_ENABLED=false(기본)·미재빌드 환경에서도 네이티브 모듈을 찾으러 가
 * ExpoTrackingTransparency / RNGoogleMobileAdsModule 부재 시 크래시하기 때문이다.
 */
export function useMobileAds() {
  useEffect(() => {
    if (!ADS_ENABLED) return;

    let cancelled = false;

    void (async () => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const {
        getTrackingPermissionsAsync,
        PermissionStatus,
        requestTrackingPermissionsAsync,
      } = require('expo-tracking-transparency');
      const mobileAds = require('react-native-google-mobile-ads').default;
      /* eslint-enable @typescript-eslint/no-require-imports */

      const { status } = await getTrackingPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        await requestTrackingPermissionsAsync();
      }
      if (cancelled) return;
      await mobileAds().initialize();
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
