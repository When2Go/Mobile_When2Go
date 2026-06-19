// 백그라운드/종료 상태 FCM data-only 메시지 차단.
// setBackgroundMessageHandler는 AppRegistry 등록 전에 호출해야 하므로 이 파일에서 처리.
// notification 필드가 있는 메시지는 OS가 자동 표시하므로 이 핸들러로 차단 불가.
const { getApp } = require('@react-native-firebase/app');
const { getMessaging } = require('@react-native-firebase/messaging');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const RESERVATION_TOGGLE_KEY = 'when2go.reservationToggle';

getMessaging(getApp()).setBackgroundMessageHandler(async (remoteMessage) => {
  const rawId = remoteMessage.data?.reservationId;
  if (rawId === undefined || rawId === null) return;

  try {
    const stored = await AsyncStorage.getItem(RESERVATION_TOGGLE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const disabledIds = parsed?.state?.disabledIds;
    if (Array.isArray(disabledIds) && disabledIds.includes(Number(rawId))) return;
  } catch {
    // 스토리지 읽기 실패 시 알림 통과
  }
});

require('expo-router/entry');
