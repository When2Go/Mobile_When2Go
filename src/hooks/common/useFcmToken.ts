import { useEffect } from 'react';
import { Alert, BackHandler, PermissionsAndroid, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';

import { registerFcmToken } from '@/api/notification';
import { getUserStatus, registerUser } from '@/api/user';
import type { DevicePlatform } from '@/api/user/types';
import { useDeviceStore } from '@/stores/deviceStore';
import { useReservationToggleStore } from '@/stores/reservationToggleStore';

const FCM_RETRY_COUNT = 1;
const ANDROID_MIN_NOTIFICATION_API = 33;

const FCM_ALERT_TITLE = '알림 설정 실패';
const FCM_ALERT_MESSAGE = '알림 설정 중 오류가 발생했습니다. 앱을 다시 실행해 주세요.';
const FCM_ALERT_BUTTON = '확인';

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await requestPermission(getMessaging(getApp()));
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  }

  if (Number(Platform.Version) < ANDROID_MIN_NOTIFICATION_API) return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function resolvePlatform(): DevicePlatform {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

async function withRetry(task: () => Promise<unknown>, retriesLeft: number): Promise<void> {
  try {
    await task();
  } catch (err) {
    console.warn('[FCM] 백엔드 호출 실패', { retriesLeft, err });
    if (retriesLeft > 0) {
      await withRetry(task, retriesLeft - 1);
    } else {
      throw new Error('FCM backend call failed after retry');
    }
  }
}

function exitApp(): void {
  BackHandler.exitApp();
}

function showFatalAlert(): void {
  Alert.alert(FCM_ALERT_TITLE, FCM_ALERT_MESSAGE, [
    { text: FCM_ALERT_BUTTON, onPress: exitApp },
  ]);
}

export function useFcmToken(): void {
  // 포그라운드 data-only 메시지: reservationId가 비활성 목록에 있으면 무시
  useEffect(() => {
    return onMessage(getMessaging(getApp()), (remoteMessage) => {
      const rawId = remoteMessage.data?.reservationId;
      if (!rawId) return;
      const { disabledIds } = useReservationToggleStore.getState();
      if (disabledIds.includes(Number(rawId))) return;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      const token = await getToken(getMessaging(getApp()));

      const { ensureDeviceId, lastFcmToken, setLastFcmToken } =
        useDeviceStore.getState();
      const deviceId = await ensureDeviceId();

      let exists: boolean;
      try {
        const status = await getUserStatus();
        exists = status.exists;
      } catch (err) {
        console.warn('[FCM] /users/status 호출 실패', err);
        showFatalAlert();
        return;
      }

      try {
        if (!exists) {
          await withRetry(
            () =>
              registerUser({
                deviceId,
                platform: resolvePlatform(),
                fcmToken: token,
              }),
            FCM_RETRY_COUNT,
          );
        } else if (lastFcmToken !== token) {
          await withRetry(
            () => registerFcmToken({ fcmToken: token }),
            FCM_RETRY_COUNT,
          );
        } else {
          return;
        }
        setLastFcmToken(token);
      } catch (err) {
        console.warn('[FCM] 백엔드 등록 최종 실패', err);
        showFatalAlert();
      }
    };

    void init();
  }, []);
}
