import { useEffect } from 'react';
import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';

import { ADS_ENABLED } from '@/config/ads';

/**
 * 광고 SDK 부트스트랩 훅. ADS_ENABLED(=심사 통과 후 활성화) 일 때만
 * iOS ATT(추적 투명성) 동의를 먼저 받고 Google Mobile Ads SDK 를 1회 초기화한다.
 * 비활성 상태(기본)에서는 아무 동작도 하지 않아 placeholder 정책을 유지한다.
 */
export function useMobileAds() {
  useEffect(() => {
    if (!ADS_ENABLED) return;

    let cancelled = false;

    void (async () => {
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
