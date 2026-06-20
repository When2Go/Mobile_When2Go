jest.mock('@/api/axios', () => ({
  api: { post: jest.fn() },
}));

// eslint-disable-next-line import/first
import { api } from '@/api/axios';
// eslint-disable-next-line import/first
import { transcribeVoice } from '../index';
import type { TripParseResponse } from '../types';

const mockPost = api.post as jest.Mock;

const FULL_RESPONSE: TripParseResponse = {
  startLocation: null,
  endLocation: '강남역',
  appointmentTime: '2026-05-07 14:00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('transcribeVoice', () => {
  test('정상 응답 — TripParseResponse를 그대로 반환한다', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: FULL_RESPONSE } });

    const result = await transcribeVoice('file:///audio/recording.m4a');

    expect(result).toEqual(FULL_RESPONSE);
    expect(mockPost).toHaveBeenCalledWith('/api/trips/parse', expect.any(FormData));
  });

  test('appointmentTime이 null인 응답 — null 그대로 반환한다', async () => {
    const noTime: TripParseResponse = { ...FULL_RESPONSE, appointmentTime: null };
    mockPost.mockResolvedValueOnce({ data: { data: noTime } });

    const result = await transcribeVoice('file:///audio/recording.m4a');

    expect(result.appointmentTime).toBeNull();
  });

  test('네트워크 에러 — 예외를 그대로 던진다', async () => {
    mockPost.mockRejectedValueOnce(new Error('network'));

    await expect(transcribeVoice('file:///audio/recording.m4a')).rejects.toThrow('network');
  });
});
