jest.mock('@react-native-async-storage/async-storage', () => {
  let memoryStore: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => memoryStore[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        memoryStore[key] = value;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete memoryStore[key];
      }),
      clear: jest.fn(async () => {
        memoryStore = {};
      }),
    },
  };
});

const fixedUuids = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
];

jest.mock('expo-crypto', () => {
  let callIndex = 0;
  return {
    __esModule: true,
    randomUUID: jest.fn(() => {
      const v = fixedUuids[callIndex] ?? '00000000-0000-4000-8000-000000000000';
      callIndex += 1;
      return v;
    }),
  };
});

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { useDeviceStore } from '../deviceStore';

describe('deviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({ deviceId: null });
    jest.clearAllMocks();
  });

  test('초기 deviceId는 null이다 (앱 첫 실행 가정)', () => {
    expect(useDeviceStore.getState().deviceId).toBeNull();
  });

  test('ensureDeviceId() 호출 시 UUID v4 형식의 deviceId가 생성된다', async () => {
    const id = await useDeviceStore.getState().ensureDeviceId();
    expect(id).toBe(fixedUuids[0]);
    expect(useDeviceStore.getState().deviceId).toBe(fixedUuids[0]);
  });

  test('이미 deviceId가 있으면 ensureDeviceId()는 기존 값을 반환하고 새로 만들지 않는다', async () => {
    useDeviceStore.setState({ deviceId: fixedUuids[0] });

    const id = await useDeviceStore.getState().ensureDeviceId();

    expect(id).toBe(fixedUuids[0]);
    // 두 번째 UUID가 소비되지 않았어야 한다
    expect(useDeviceStore.getState().deviceId).toBe(fixedUuids[0]);
  });
});
