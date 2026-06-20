import { api } from '@/api/axios';
import type { TripParseResponse } from './types';

const VOICE_PARSE_PATH = '/api/trips/parse';

/**
 * 오디오 파일을 서버에 전송하고 목적지·도착 시각을 파싱한 결과를 반환한다.
 * Content-Type은 axios가 FormData를 감지해 multipart/form-data; boundary=… 로 자동 설정한다.
 */
export async function transcribeVoice(uri: string): Promise<TripParseResponse> {
  const form = new FormData();
  form.append('file', { uri, name: 'recording.m4a', type: 'audio/m4a' } as unknown as Blob);

  const res = await api.post<{ data: TripParseResponse }>(VOICE_PARSE_PATH, form);
  return res.data.data;
}
