import { AxiosError, type AxiosResponse } from 'axios';

import type { ApiFailure } from '@/types/api.types';

import { normalizeAxiosError } from '../error';

/** status/봉투 message를 가진 응답을 흉내내는 AxiosError 생성 헬퍼. */
function errorWithResponse(
  status: number,
  message: string | null = null,
): AxiosError {
  const response = {
    status,
    data: { success: false, data: null, message },
  } as unknown as AxiosResponse;
  const err = new AxiosError('request failed', String(status));
  err.response = response;
  return err;
}

/** 응답은 없고 request만 있는(= 네트워크 단절) AxiosError. */
function networkError(): AxiosError {
  const err = new AxiosError('Network Error', AxiosError.ERR_NETWORK);
  err.request = {};
  err.response = undefined;
  return err;
}

/** ECONNABORTED 코드를 가진 타임아웃 AxiosError (response 없음). */
function timeoutError(): AxiosError {
  const err = new AxiosError('timeout exceeded', AxiosError.ECONNABORTED);
  err.request = {};
  err.response = undefined;
  return err;
}

describe('normalizeAxiosError', () => {
  // 정상/분기: 상태코드별 reason 매핑
  test('401 → UNAUTHORIZED', async () => {
    await expect(
      normalizeAxiosError(errorWithResponse(401)),
    ).rejects.toMatchObject({ ok: false, reason: 'UNAUTHORIZED', status: 401 });
  });

  test('403 → FORBIDDEN', async () => {
    await expect(
      normalizeAxiosError(errorWithResponse(403)),
    ).rejects.toMatchObject({ ok: false, reason: 'FORBIDDEN', status: 403 });
  });

  test('400 → BAD_REQUEST', async () => {
    await expect(
      normalizeAxiosError(errorWithResponse(400)),
    ).rejects.toMatchObject({ ok: false, reason: 'BAD_REQUEST', status: 400 });
  });

  test('500 → SERVER', async () => {
    await expect(
      normalizeAxiosError(errorWithResponse(500)),
    ).rejects.toMatchObject({ ok: false, reason: 'SERVER', status: 500 });
  });

  test('503 (5xx 경계) → SERVER', async () => {
    await expect(
      normalizeAxiosError(errorWithResponse(503)),
    ).rejects.toMatchObject({ ok: false, reason: 'SERVER', status: 503 });
  });

  // 경계: 응답 없이 request만 → NETWORK
  test('응답이 없으면(request만 존재) → NETWORK, status 없음', async () => {
    const failure = (await normalizeAxiosError(networkError()).catch(
      (e: ApiFailure) => e,
    )) as ApiFailure;

    expect(failure.ok).toBe(false);
    expect(failure.reason).toBe('NETWORK');
    expect(failure.status).toBeUndefined();
  });

  // 경계/분기: ECONNABORTED → TIMEOUT (NETWORK보다 먼저 판정되어야 함)
  test('ECONNABORTED 코드면 NETWORK가 아니라 TIMEOUT으로 판정한다', async () => {
    const failure = (await normalizeAxiosError(timeoutError()).catch(
      (e: ApiFailure) => e,
    )) as ApiFailure;

    expect(failure.reason).toBe('TIMEOUT');
  });

  // 에러: 분류 불가 → UNKNOWN
  test('상태코드/응답/요청이 모두 없으면 → UNKNOWN', async () => {
    const err = new AxiosError('weird');
    await expect(normalizeAxiosError(err)).rejects.toMatchObject({
      ok: false,
      reason: 'UNKNOWN',
    });
  });

  test('axios 에러가 아닌 값(throw된 일반 객체)도 UNKNOWN으로 정규화한다', async () => {
    await expect(
      normalizeAxiosError(new Error('boom')),
    ).rejects.toMatchObject({ ok: false, reason: 'UNKNOWN' });
  });

  // 백엔드 봉투 message 전달
  test('백엔드 봉투 message가 있으면 정규화 결과 message로 전달한다', async () => {
    const failure = (await normalizeAxiosError(
      errorWithResponse(400, '도착 시간을 확인해주세요.'),
    ).catch((e: ApiFailure) => e)) as ApiFailure;

    expect(failure.message).toBe('도착 시간을 확인해주세요.');
  });

  // reject 형태 검증: 항상 { ok:false } 형태
  test('reject 값은 항상 { ok:false } Discriminated Union 형태다', async () => {
    const failure = (await normalizeAxiosError(errorWithResponse(401)).catch(
      (e: ApiFailure) => e,
    )) as ApiFailure;

    expect(failure).toEqual(
      expect.objectContaining({ ok: false, reason: expect.any(String) }),
    );
  });
});
