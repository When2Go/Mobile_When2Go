import { useEffect } from 'react';
import { Alert, BackHandler, PermissionsAndroid, Platform } from 'react-native';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';

import { registerFcmToken } from '@/api/notification';

const FCM_RETRY_COUNT = 1;
const ANDROID_MIN_NOTIFICATION_API = 33;

const FCM_ALERT_TITLE = '알림 설정 실패';
const FCM_ALERT_MESSAGE = '알림 설정 중 오류가 발생했습니다. 앱을 다시 실행해 주세요.';
const FCM_ALERT_BUTTON = '확인';

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await messaging().requestPermission();
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.Version < ANDROID_MIN_NOTIFICATION_API) return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function sendTokenWithRetry(token: string, retriesLeft: number): Promise<void> {
  try {
    await registerFcmToken({ fcmToken: token });
  } catch (err) {
    console.warn('[FCM] registerFcmToken 실패', { retriesLeft, err });
    if (retriesLeft > 0) {
      await sendTokenWithRetry(token, retriesLeft - 1);
    } else {
      throw new Error('FCM token registration failed after retry');
    }
  }
}

function exitApp(): void {
  BackHandler.exitApp();
}

export function useFcmToken(): void {
  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      const token = await messaging().getToken();
      console.log('[FCM] 토큰 발급 성공', token);

      try {
        await sendTokenWithRetry(token, FCM_RETRY_COUNT);
        console.log('[FCM] 백엔드 등록 성공');
      } catch (err) {
        console.warn('[FCM] 백엔드 등록 최종 실패', err);
        Alert.alert(FCM_ALERT_TITLE, FCM_ALERT_MESSAGE, [
          { text: FCM_ALERT_BUTTON, onPress: exitApp },
        ]);
      }
    };

    void init();
  }, []);
}
