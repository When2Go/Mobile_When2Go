import { api } from '@/api/axios';
import type { TripParseResponse } from './types';

const VOICE_PARSE_PATH = '/api/trips/parse';
const RECORDING_FILE_NAME = 'recording.m4a';
const RECORDING_MIME_TYPE = 'audio/m4a';

/**
 * 오디오 파일을 서버에 전송하고 목적지·도착 시각을 파싱한 결과를 반환한다.
 * Content-Type은 axios가 FormData를 감지해 multipart/form-data; boundary=… 로 자동 설정한다.
 */
export async function transcribeVoice(uri: string): Promise<TripParseResponse> {
  const form = new FormData();
  form.append('file', { uri, name: RECORDING_FILE_NAME, type: RECORDING_MIME_TYPE } as unknown as Blob);

  console.log('[Voice] 서버 전송 시작:', VOICE_PARSE_PATH, '| 파일:', uri);
  const res = await api.post<{ data: TripParseResponse }>(VOICE_PARSE_PATH, form);
  console.log('[Voice] 서버 응답:', JSON.stringify(res.data, null, 2));
  return res.data.data;
}
