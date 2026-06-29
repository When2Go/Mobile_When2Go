import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import { registerLiveActivityToken } from '@/api/notification';
import * as LiveActivity from '@/modules/liveActivity';
import {
  isLiveActivityMessage,
  localProgress,
  minutesUntilBoarding,
  parseLiveActivityPayload,
  shouldEndActivity,
  type LiveActivityPayload,
} from '@/utils/liveActivity/contentState';

// 카드가 떠 있는 동안 로컬에서 남은 시간·진행도를 다시 그리는 주기.
const LOCAL_TICK_MS = 15_000;

function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

async function sendToken(
  kind: 'PUSH_TO_START' | 'ACTIVITY',
  token: string,
  activityId?: string,
): Promise<void> {
  try {
    await registerLiveActivityToken({ liveActivityToken: token, kind, activityId });
  } catch (err) {
    // 백엔드 엔드포인트 협의 전이거나 일시 오류여도 앱 흐름을 막지 않는다.
    console.warn('[LiveActivity] 토큰 등록 실패', { kind, err });
  }
}

/**
 * iOS Live Activity(F-W01) 라이프사이클 훅.
 * - push-to-start / per-activity 토큰을 백엔드에 등록(APNs 직접 전송용).
 * - 출발 10분 전 FCM data 메시지를 포그라운드에서 받으면 로컬로 Activity 시작(폴백).
 * - 카드가 떠 있는 동안 남은 시간·진행도를 갱신하고, 첫 대중교통 탑승 시각에 종료.
 *
 * 보통 앱이 꺼져 있을 때는 백엔드 APNs push 가 시작/갱신/종료를 담당한다.
 */
export function useLiveActivity(): void {
  const payloadRef = useRef<LiveActivityPayload | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !LiveActivity.isSupported) return;

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

      if (shouldEndActivity(boardingEpoch, now)) {
        void LiveActivity.end(true);
        payloadRef.current = null;
        stopTicking();
        return;
      }

      void LiveActivity.update({
        ...payload.state,
        transitMinutes: minutesUntilBoarding(boardingEpoch, now),
        progress: localProgress(payload.departEpoch, boardingEpoch, now),
      });
    };

    const startFromMessage = async (data: Record<string, string | undefined>) => {
      const payload = parseLiveActivityPayload(data);
      if (!payload) return;

      payloadRef.current = payload;
      await LiveActivity.start(payload.attributes, payload.state);
      stopTicking();
      tickRef.current = setInterval(tick, LOCAL_TICK_MS);
    };

    // push-to-start / 갱신 토큰 등록.
    LiveActivity.registerForPushToStartToken();
    const pushToStartSub = LiveActivity.addPushToStartTokenListener(({ token }) => {
      void sendToken('PUSH_TO_START', token);
    });
    const activityTokenSub = LiveActivity.addActivityPushTokenListener(
      ({ token, activityId }) => {
        void sendToken('ACTIVITY', token, activityId);
      },
    );
    const endSub = LiveActivity.addActivityEndListener(() => {
      payloadRef.current = null;
      stopTicking();
    });

    // 포그라운드에서 출발 10분 전 메시지를 받으면 로컬로 시작.
    const messageSub = onMessage(getMessaging(getApp()), (remoteMessage) => {
      if (!isLiveActivityMessage(remoteMessage.data as Record<string, string | undefined>)) {
        return;
      }
      void startFromMessage(remoteMessage.data as Record<string, string | undefined>);
    });

    return () => {
      pushToStartSub?.remove();
      activityTokenSub?.remove();
      endSub?.remove();
      messageSub();
      stopTicking();
    };
  }, []);
}
