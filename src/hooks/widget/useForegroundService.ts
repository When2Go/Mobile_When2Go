import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import * as ForegroundService from '@/modules/foregroundService';
import {
  isForegroundMessage,
  localProgress,
  minutesUntilBoarding,
  parseForegroundPayload,
  shouldEndService,
  type ForegroundServicePayload,
} from '@/utils/foregroundService/contentState';

// 위젯이 떠 있는 동안 로컬에서 남은 시간·진행도를 다시 그리는 주기.
const LOCAL_TICK_MS = 15_000;
// POST_NOTIFICATIONS 런타임 권한이 필요한 Android API 레벨(13).
const ANDROID_POST_NOTIFICATIONS_API = 33;

function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

/** Android 13+ 에서 알림 권한을 요청한다. 그 이하·미지원이면 허용으로 본다. */
async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < ANDROID_POST_NOTIFICATIONS_API) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Android Foreground Service 위젯(F-W02) 라이프사이클 훅.
 * - 출발 10분 전 FCM data 메시지를 포그라운드에서 받으면 로컬로 Service 시작(폴백).
 * - 위젯이 떠 있는 동안 남은 시간·진행도를 갱신하고, 첫 대중교통 탑승 시각에 종료.
 *
 * 보통 앱이 꺼져 있을 때는 백엔드 FCM high-priority push 가 시작/갱신을 담당한다(백엔드 협의 후).
 */
export function useForegroundService(): void {
  const payloadRef = useRef<ForegroundServicePayload | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android' || !ForegroundService.isSupported) return;

    const stopTicking = () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    const tick = () => {
      const payload = payloadRef.current;
      if (!payload) return;

      const now = nowEpoch();
      const { boardingEpoch } = payload.state;

      if (shouldEndService(boardingEpoch, now)) {
        void ForegroundService.stop();
        payloadRef.current = null;
        stopTicking();
        return;
      }

      void ForegroundService.update({
        ...payload.state,
        transitMinutes: minutesUntilBoarding(boardingEpoch, now),
        progress: localProgress(payload.departEpoch, boardingEpoch, now),
      });
    };

    const startFromMessage = async (data: Record<string, string | undefined>) => {
      const payload = parseForegroundPayload(data);
      if (!payload) return;

      const granted = await ensureNotificationPermission();
      if (!granted) return;

      payloadRef.current = payload;
      await ForegroundService.start(payload.attributes, payload.state);
      stopTicking();
      tickRef.current = setInterval(tick, LOCAL_TICK_MS);
    };

    // 포그라운드에서 출발 10분 전 메시지를 받으면 로컬로 시작.
    const messageSub = onMessage(getMessaging(getApp()), (remoteMessage) => {
      if (!isForegroundMessage(remoteMessage.data as Record<string, string | undefined>)) {
        return;
      }
      void startFromMessage(remoteMessage.data as Record<string, string | undefined>);
    });

    return () => {
      messageSub();
      stopTicking();
    };
  }, []);
}
