jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/api/notification', () => ({
  registerFcmToken: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert, BackHandler, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import { registerFcmToken } from '@/api/notification';
import { useFcmToken } from '../useFcmToken';

const mockGetToken = jest.fn();

function setPlatform(os: string, version: number) {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  Object.defineProperty(Platform, 'Version', { value: version, configurable: true });
}

beforeEach(() => {
  jest.clearAllMocks();
  setPlatform('android', 33);
  mockGetToken.mockResolvedValue('mock-fcm-token');
  (messaging as jest.Mock).mockReturnValue({ getToken: mockGetToken });
  (registerFcmToken as jest.Mock).mockResolvedValue({});
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => true);
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
    PermissionsAndroid.RESULTS.GRANTED,
  );
});

describe('useFcmToken', () => {
  describe('requestAndroidPermission', () => {
    it('iOS에서는 권한 요청 없이 토큰 발급을 진행한다', async () => {
      setPlatform('ios', 17);

      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
      expect(PermissionsAndroid.request).not.toHaveBeenCalled();
    });

    it('Android API 32 이하에서는 권한 요청 없이 토큰 발급을 진행한다', async () => {
      setPlatform('android', 32);

      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
      expect(PermissionsAndroid.request).not.toHaveBeenCalled();
    });

    it('Android API 33 이상에서 권한 허용 시 토큰 발급을 진행한다', async () => {
      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
    });

    it('Android API 33 이상에서 권한 거부 시 토큰 발급을 하지 않는다', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.DENIED,
      );

      renderHook(() => useFcmToken());

      await waitFor(() => expect(PermissionsAndroid.request).toHaveBeenCalled());
      expect(mockGetToken).not.toHaveBeenCalled();
    });
  });

  describe('sendTokenWithRetry', () => {
    it('첫 번째 시도 성공 시 Alert를 표시하지 않는다', async () => {
      renderHook(() => useFcmToken());

      await waitFor(() =>
        expect(registerFcmToken).toHaveBeenCalledWith({ fcmToken: 'mock-fcm-token' }),
      );
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('첫 번째 실패 후 재시도 성공 시 Alert를 표시하지 않는다', async () => {
      (registerFcmToken as jest.Mock)
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue({});

      renderHook(() => useFcmToken());

      await waitFor(() => expect(registerFcmToken).toHaveBeenCalledTimes(2));
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('재시도 횟수를 초과하면 Alert를 표시한다', async () => {
      (registerFcmToken as jest.Mock).mockRejectedValue(new Error('network error'));

      renderHook(() => useFcmToken());

      await waitFor(() =>
        expect(Alert.alert).toHaveBeenCalledWith(
          '알림 설정 실패',
          '알림 설정 중 오류가 발생했습니다. 앱을 다시 실행해 주세요.',
          expect.arrayContaining([expect.objectContaining({ text: '확인' })]),
        ),
      );
    });

    it('Alert 확인 버튼 클릭 시 앱을 종료한다', async () => {
      (registerFcmToken as jest.Mock).mockRejectedValue(new Error('network error'));

      let capturedButtons: { text: string; onPress?: () => void }[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_title, _msg, buttons) => {
        capturedButtons = buttons ?? [];
      });

      renderHook(() => useFcmToken());

      await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

      capturedButtons[0]?.onPress?.();
      expect(BackHandler.exitApp).toHaveBeenCalled();
    });
  });
});
