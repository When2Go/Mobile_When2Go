jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(),
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    EPHEMERAL: 3,
  },
}));

jest.mock('@/api/notification', () => ({
  registerFcmToken: jest.fn(),
}));

jest.mock('@/api/user', () => ({
  getUserStatus: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock('@/stores/deviceStore', () => {
  const state = {
    deviceId: 'device-uuid-1234567890-aaaa-bbbb-cccc-dddd' as string | null,
    lastFcmToken: null as string | null,
  };
  const ensureDeviceId = jest.fn(async () => state.deviceId ?? '');
  const setLastFcmToken = jest.fn((t: string) => {
    state.lastFcmToken = t;
  });
  return {
    __esModule: true,
    __state: state,
    useDeviceStore: {
      getState: () => ({
        deviceId: state.deviceId,
        lastFcmToken: state.lastFcmToken,
        ensureDeviceId,
        setLastFcmToken,
      }),
    },
  };
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert, BackHandler, PermissionsAndroid, Platform } from 'react-native';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';

import { registerFcmToken } from '@/api/notification';
import { getUserStatus, registerUser } from '@/api/user';
import { useFcmToken } from '../useFcmToken';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deviceStoreMock = require('@/stores/deviceStore');

const mockGetToken = jest.fn();
const mockRequestPermission = jest.fn();

function setPlatform(os: string, version: number) {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  Object.defineProperty(Platform, 'Version', { value: version, configurable: true });
}

function resetDeviceState() {
  deviceStoreMock.__state.deviceId = 'device-uuid-1234567890-aaaa-bbbb-cccc-dddd';
  deviceStoreMock.__state.lastFcmToken = null;
}

beforeEach(() => {
  jest.clearAllMocks();
  resetDeviceState();
  setPlatform('android', 33);
  mockGetToken.mockResolvedValue('mock-fcm-token');
  mockRequestPermission.mockResolvedValue(AuthorizationStatus.AUTHORIZED);
  (messaging as jest.Mock).mockReturnValue({
    getToken: mockGetToken,
    requestPermission: mockRequestPermission,
  });
  (getUserStatus as jest.Mock).mockResolvedValue({ exists: true });
  (registerFcmToken as jest.Mock).mockResolvedValue({});
  (registerUser as jest.Mock).mockResolvedValue({});
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => true);
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
    PermissionsAndroid.RESULTS.GRANTED,
  );
});

describe('useFcmToken', () => {
  describe('requestNotificationPermission', () => {
    it('iOS에서 권한 허용 시 토큰 발급을 진행한다', async () => {
      setPlatform('ios', 17);
      mockRequestPermission.mockResolvedValue(AuthorizationStatus.AUTHORIZED);

      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(PermissionsAndroid.request).not.toHaveBeenCalled();
    });

    it('iOS에서 PROVISIONAL 권한도 허용으로 간주한다', async () => {
      setPlatform('ios', 17);
      mockRequestPermission.mockResolvedValue(AuthorizationStatus.PROVISIONAL);

      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
    });

    it('iOS에서 권한 거부 시 토큰 발급을 하지 않는다', async () => {
      setPlatform('ios', 17);
      mockRequestPermission.mockResolvedValue(AuthorizationStatus.DENIED);

      renderHook(() => useFcmToken());

      await waitFor(() => expect(mockRequestPermission).toHaveBeenCalled());
      expect(mockGetToken).not.toHaveBeenCalled();
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

  describe('registration flow', () => {
    it('exists=false면 POST /api/users로 신규 등록한다', async () => {
      (getUserStatus as jest.Mock).mockResolvedValue({ exists: false });

      renderHook(() => useFcmToken());

      await waitFor(() => expect(registerUser).toHaveBeenCalled());
      expect(registerUser).toHaveBeenCalledWith({
        deviceId: 'device-uuid-1234567890-aaaa-bbbb-cccc-dddd',
        platform: 'ANDROID',
        fcmToken: 'mock-fcm-token',
      });
      expect(registerFcmToken).not.toHaveBeenCalled();
    });

    it('exists=true이고 토큰이 바뀌었으면 PATCH로 갱신한다', async () => {
      deviceStoreMock.__state.lastFcmToken = 'old-token';

      renderHook(() => useFcmToken());

      await waitFor(() =>
        expect(registerFcmToken).toHaveBeenCalledWith({ fcmToken: 'mock-fcm-token' }),
      );
      expect(registerUser).not.toHaveBeenCalled();
    });

    it('exists=true이고 토큰이 동일하면 PATCH를 호출하지 않는다', async () => {
      deviceStoreMock.__state.lastFcmToken = 'mock-fcm-token';

      renderHook(() => useFcmToken());

      await waitFor(() => expect(getUserStatus).toHaveBeenCalled());
      expect(registerFcmToken).not.toHaveBeenCalled();
      expect(registerUser).not.toHaveBeenCalled();
    });

    it('iOS는 platform=IOS로 신규 등록한다', async () => {
      setPlatform('ios', 17);
      (getUserStatus as jest.Mock).mockResolvedValue({ exists: false });

      renderHook(() => useFcmToken());

      await waitFor(() =>
        expect(registerUser).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'IOS' }),
        ),
      );
    });
  });

  describe('status 에러 처리', () => {
    it('GET status 실패 시 Alert를 표시하고 앱을 종료한다', async () => {
      (getUserStatus as jest.Mock).mockRejectedValue(new Error('network'));

      let capturedButtons: { text: string; onPress?: () => void }[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
        capturedButtons = buttons ?? [];
      });

      renderHook(() => useFcmToken());

      await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
      capturedButtons[0]?.onPress?.();
      expect(BackHandler.exitApp).toHaveBeenCalled();
      expect(registerFcmToken).not.toHaveBeenCalled();
      expect(registerUser).not.toHaveBeenCalled();
    });
  });

  describe('등록 실패 재시도', () => {
    it('PATCH 첫 실패 후 재시도 성공 시 Alert를 표시하지 않는다', async () => {
      deviceStoreMock.__state.lastFcmToken = 'old-token';
      (registerFcmToken as jest.Mock)
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue({});

      renderHook(() => useFcmToken());

      await waitFor(() => expect(registerFcmToken).toHaveBeenCalledTimes(2));
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('PATCH 재시도 초과 시 Alert를 표시하고 앱을 종료한다', async () => {
      deviceStoreMock.__state.lastFcmToken = 'old-token';
      (registerFcmToken as jest.Mock).mockRejectedValue(new Error('network'));

      let capturedButtons: { text: string; onPress?: () => void }[] = [];
      (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
        capturedButtons = buttons ?? [];
      });

      renderHook(() => useFcmToken());

      await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
      capturedButtons[0]?.onPress?.();
      expect(BackHandler.exitApp).toHaveBeenCalled();
    });

    it('POST 재시도 초과 시에도 Alert + 앱 종료', async () => {
      (getUserStatus as jest.Mock).mockResolvedValue({ exists: false });
      (registerUser as jest.Mock).mockRejectedValue(new Error('network'));

      renderHook(() => useFcmToken());

      await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    });
  });
});
