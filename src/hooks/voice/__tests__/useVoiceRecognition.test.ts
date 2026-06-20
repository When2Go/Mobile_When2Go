import { act, renderHook } from '@testing-library/react-native';

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('@/api/voice', () => ({
  transcribeVoice: jest.fn(),
}));

// eslint-disable-next-line import/first
import { Audio } from 'expo-av';
// eslint-disable-next-line import/first
import { transcribeVoice } from '@/api/voice';
// eslint-disable-next-line import/first
import { useVoiceRecognition } from '../useVoiceRecognition';

const mockRequestPermissions = Audio.requestPermissionsAsync as jest.Mock;
const mockSetAudioMode = Audio.setAudioModeAsync as jest.Mock;
const mockCreateAsync = Audio.Recording.createAsync as jest.Mock;
const mockTranscribeVoice = transcribeVoice as jest.MockedFunction<typeof transcribeVoice>;

const MOCK_URI = 'file:///audio/recording.m4a';
const MOCK_RESPONSE = {
  startLocation: null,
  endLocation: '강남역',
  appointmentTime: '2026-05-07 14:00',
};

function makeRecording(uri: string | null = MOCK_URI) {
  return {
    stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
    getURI: jest.fn().mockReturnValue(uri),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSetAudioMode.mockResolvedValue(undefined);
});

describe('useVoiceRecognition', () => {
  describe('정상: 권한 허용 → start() → stage=recording', () => {
    it('start() 후 stage가 recording으로 바뀐다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      mockCreateAsync.mockResolvedValueOnce({ recording: makeRecording() });

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.stage).toBe('recording');
      expect(result.current.error).toBeNull();
    });
  });

  describe('정상: stop() → 업로드 성공 → stage=done, result 세팅', () => {
    it('stop() 후 stage가 done이 되고 result가 세팅된다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      const recording = makeRecording();
      mockCreateAsync.mockResolvedValueOnce({ recording });
      mockTranscribeVoice.mockResolvedValueOnce(MOCK_RESPONSE);

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.stage).toBe('done');
      expect(result.current.result).toEqual(MOCK_RESPONSE);
      expect(result.current.error).toBeNull();
    });
  });

  describe('분기: 권한 거부 → error=permission_denied', () => {
    it('권한 거부 시 error가 permission_denied, stage가 error가 된다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.stage).toBe('error');
      expect(result.current.error).toBe('permission_denied');
    });
  });

  describe('분기: getURI가 null → error=recording_failed', () => {
    it('녹음 URI가 null이면 error가 recording_failed, stage가 error가 된다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      mockCreateAsync.mockResolvedValueOnce({ recording: makeRecording(null) });

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
        await result.current.stop();
      });

      expect(result.current.stage).toBe('error');
      expect(result.current.error).toBe('recording_failed');
    });
  });

  describe('에러: 서버 오류 → error=server_error', () => {
    it('transcribeVoice 실패 시 error가 server_error, stage가 error가 된다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      mockCreateAsync.mockResolvedValueOnce({ recording: makeRecording() });
      mockTranscribeVoice.mockRejectedValueOnce(new Error('502'));

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
        await result.current.stop();
      });

      expect(result.current.stage).toBe('error');
      expect(result.current.error).toBe('server_error');
    });
  });

  describe('정상: reset() → 초기 상태 복원', () => {
    it('done 상태에서 reset() 하면 stage=idle, result=null, error=null', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      mockCreateAsync.mockResolvedValueOnce({ recording: makeRecording() });
      mockTranscribeVoice.mockResolvedValueOnce(MOCK_RESPONSE);

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
        await result.current.stop();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.stage).toBe('idle');
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('분기: cancel() → 녹음 중단 후 idle 복원', () => {
    it('recording 중 cancel() 하면 stage=idle, 업로드하지 않는다', async () => {
      mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
      const recording = makeRecording();
      mockCreateAsync.mockResolvedValueOnce({ recording });

      const { result } = renderHook(() => useVoiceRecognition());

      await act(async () => {
        await result.current.start();
      });

      await act(async () => {
        await result.current.cancel();
      });

      expect(result.current.stage).toBe('idle');
      expect(recording.stopAndUnloadAsync).toHaveBeenCalledTimes(1);
      expect(mockTranscribeVoice).not.toHaveBeenCalled();
    });
  });
});
