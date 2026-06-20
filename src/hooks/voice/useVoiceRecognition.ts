import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import { transcribeVoice } from '@/api/voice';
import type { TripParseResponse } from '@/api/voice/types';

export type VoiceStage = 'idle' | 'recording' | 'processing' | 'done' | 'error';
export type VoiceError = 'permission_denied' | 'recording_failed' | 'server_error';

export interface UseVoiceRecognitionReturn {
  stage: VoiceStage;
  result: TripParseResponse | null;
  error: VoiceError | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [stage, setStage] = useState<VoiceStage>('idle');
  const [result, setResult] = useState<TripParseResponse | null>(null);
  const [error, setError] = useState<VoiceError | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const reset = useCallback(() => {
    setStage('idle');
    setResult(null);
    setError(null);
  }, []);

  const start = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setError('permission_denied');
      setStage('error');
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setStage('recording');
    } catch {
      setError('recording_failed');
      setStage('error');
    }
  }, []);

  const stop = useCallback(async () => {
    if (!recordingRef.current) return;
    setStage('processing');
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    console.log('[Voice] 녹음 파일 URI:', uri);
    if (!uri) {
      setError('recording_failed');
      setStage('error');
      return;
    }
    try {
      const data = await transcribeVoice(uri);
      setResult(data);
      setStage('done');
    } catch (err) {
      console.error('[Voice] 서버 요청 실패:', err);
      setError('server_error');
      setStage('error');
    }
  }, []);

  const cancel = useCallback(async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    reset();
  }, [reset]);

  return { stage, result, error, start, stop, cancel, reset };
}
