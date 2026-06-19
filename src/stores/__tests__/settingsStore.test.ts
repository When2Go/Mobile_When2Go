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

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BUFFER_MAX_MINUTES,
  BUFFER_MIN_MINUTES,
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_NICKNAME,
  NICKNAME_MAX_LENGTH,
  STORAGE_KEY,
  useSettingsStore,
} from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      bufferMinutes: DEFAULT_BUFFER_MINUTES,
      nickname: DEFAULT_NICKNAME,
    });
  });

  test('초기 bufferMinutes는 기본값 10분이다', () => {
    expect(useSettingsStore.getState().bufferMinutes).toBe(10);
  });

  test('setBufferMinutes(20)이면 state.bufferMinutes === 20', () => {
    useSettingsStore.getState().setBufferMinutes(20);
    expect(useSettingsStore.getState().bufferMinutes).toBe(20);
  });

  test('음수가 들어오면 하한(0)으로 clamp 한다', () => {
    useSettingsStore.getState().setBufferMinutes(-5);
    expect(useSettingsStore.getState().bufferMinutes).toBe(BUFFER_MIN_MINUTES);
  });

  test('상한 초과 값이 들어오면 상한(30)으로 clamp 한다', () => {
    useSettingsStore.getState().setBufferMinutes(100);
    expect(useSettingsStore.getState().bufferMinutes).toBe(BUFFER_MAX_MINUTES);
  });

  test('소수가 들어오면 가까운 정수로 반올림한다', () => {
    useSettingsStore.getState().setBufferMinutes(7.4);
    expect(useSettingsStore.getState().bufferMinutes).toBe(7);
  });

  test('하한값(0)과 상한값(30)은 그대로 허용한다', () => {
    useSettingsStore.getState().setBufferMinutes(BUFFER_MIN_MINUTES);
    expect(useSettingsStore.getState().bufferMinutes).toBe(BUFFER_MIN_MINUTES);

    useSettingsStore.getState().setBufferMinutes(BUFFER_MAX_MINUTES);
    expect(useSettingsStore.getState().bufferMinutes).toBe(BUFFER_MAX_MINUTES);
  });

  test('초기 nickname은 기본값("게스트")이다', () => {
    expect(useSettingsStore.getState().nickname).toBe('게스트');
  });

  test('setNickname("주환")이면 nickname === "주환"', () => {
    useSettingsStore.getState().setNickname('주환');
    expect(useSettingsStore.getState().nickname).toBe('주환');
  });

  test('setNickname은 양쪽 공백을 trim 한다', () => {
    useSettingsStore.getState().setNickname('  주환  ');
    expect(useSettingsStore.getState().nickname).toBe('주환');
  });

  test('비어 있거나 공백만 있는 입력은 무시되어 기존 값 유지', () => {
    useSettingsStore.setState({ nickname: '주환' });
    useSettingsStore.getState().setNickname('   ');
    expect(useSettingsStore.getState().nickname).toBe('주환');

    useSettingsStore.getState().setNickname('');
    expect(useSettingsStore.getState().nickname).toBe('주환');
  });

  test('최대 길이를 초과하면 잘라서 저장한다', () => {
    const long = 'ㄱ'.repeat(NICKNAME_MAX_LENGTH + 5);
    useSettingsStore.getState().setNickname(long);
    expect(useSettingsStore.getState().nickname).toHaveLength(NICKNAME_MAX_LENGTH);
  });
});

describe('settingsStore — persist 동작', () => {
  beforeEach(async () => {
    // setState 먼저(setItem 유발) → clearAllMocks로 call history 초기화 → memoryStore 비우기
    useSettingsStore.setState({
      bufferMinutes: DEFAULT_BUFFER_MINUTES,
      nickname: DEFAULT_NICKNAME,
    });
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  test('setBufferMinutes 호출 후 AsyncStorage.setItem이 올바른 키로 호출된다', () => {
    useSettingsStore.getState().setBufferMinutes(20);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"bufferMinutes":20'),
    );
  });

  test('setNickname 호출 후 AsyncStorage.setItem이 올바른 키로 호출된다', () => {
    useSettingsStore.getState().setNickname('주환');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"nickname":"주환"'),
    );
  });

  test('partialize — 저장 JSON에는 bufferMinutes·nickname만 포함되고 액션 함수는 제외된다', () => {
    useSettingsStore.getState().setBufferMinutes(15);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const lastCall = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1) as [string, string];
    const parsed = JSON.parse(lastCall[1]) as { state: Record<string, unknown> };
    expect(parsed.state).toHaveProperty('bufferMinutes');
    expect(parsed.state).toHaveProperty('nickname');
    expect(parsed.state).not.toHaveProperty('setBufferMinutes');
    expect(parsed.state).not.toHaveProperty('setNickname');
  });

  test('rehydrate — AsyncStorage에 저장된 값으로 복원되면 store 상태가 갱신된다', async () => {
    const stored = JSON.stringify({
      state: { bufferMinutes: 25, nickname: '복원닉' },
      version: 0,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(stored);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().bufferMinutes).toBe(25);
    expect(useSettingsStore.getState().nickname).toBe('복원닉');
  });

  test('rehydrate — AsyncStorage가 비어 있으면 기본값이 유지된다', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().bufferMinutes).toBe(DEFAULT_BUFFER_MINUTES);
    expect(useSettingsStore.getState().nickname).toBe(DEFAULT_NICKNAME);
  });
});
