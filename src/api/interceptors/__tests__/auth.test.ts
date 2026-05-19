import type { InternalAxiosRequestConfig } from 'axios';

// deviceStore를 mock 해 deviceId를 테스트에서 제어한다 (deviceStore.test.ts 패턴 참고).
jest.mock('@/stores/deviceStore', () => {
  let deviceId: string | null = null;
  return {
    __esModule: true,
    useDeviceStore: {
      getState: () => ({ deviceId }),
      // 테스트 헬퍼: 다음 케이스의 deviceId 값을 주입한다.
      __setDeviceId: (v: string | null) => {
        deviceId = v;
      },
    },
  };
});

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { useDeviceStore } from '@/stores/deviceStore';
// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { DEVICE_ID_HEADER, attachDeviceId } from '../auth';

type MockStore = typeof useDeviceStore & { __setDeviceId: (v: string | null) => void };
const setDeviceId = (v: string | null) =>
  (useDeviceStore as MockStore).__setDeviceId(v);

function makeConfig(
  headers: Record<string, unknown> = {},
): InternalAxiosRequestConfig {
  return { headers } as unknown as InternalAxiosRequestConfig;
}

describe('attachDeviceId 요청 인터셉터', () => {
  beforeEach(() => {
    setDeviceId(null);
  });

  // 정상: deviceId가 있으면 X-Device-Id 헤더가 주입된다
  test('deviceId가 있으면 X-Device-Id 헤더에 주입한다', () => {
    setDeviceId('11111111-1111-4111-8111-111111111111');

    const result = attachDeviceId(makeConfig());

    expect(result.headers[DEVICE_ID_HEADER]).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  // 경계: deviceId가 null이면 헤더를 주입하지 않는다
  test('deviceId가 null이면 X-Device-Id 헤더를 주입하지 않는다', () => {
    setDeviceId(null);

    const result = attachDeviceId(makeConfig());

    expect(result.headers[DEVICE_ID_HEADER]).toBeUndefined();
  });

  // 분기: 기존 헤더를 보존한 채 X-Device-Id만 추가한다
  test('기존 헤더는 보존하고 X-Device-Id만 추가한다', () => {
    setDeviceId('22222222-2222-4222-8222-222222222222');

    const result = attachDeviceId(
      makeConfig({ 'Content-Type': 'application/json' }),
    );

    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers[DEVICE_ID_HEADER]).toBe(
      '22222222-2222-4222-8222-222222222222',
    );
  });

  // 분기: deviceId가 없으면 기존 헤더만 그대로 둔다 (불필요한 변형 없음)
  test('deviceId가 없으면 config의 기존 헤더를 그대로 반환한다', () => {
    setDeviceId(null);

    const result = attachDeviceId(
      makeConfig({ Authorization: 'Bearer x' }),
    );

    expect(result.headers.Authorization).toBe('Bearer x');
    expect(result.headers[DEVICE_ID_HEADER]).toBeUndefined();
  });
});
