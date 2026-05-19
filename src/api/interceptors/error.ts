import { AxiosError, isAxiosError } from 'axios';

import type { ApiErrorReason, ApiFailure } from '@/types/api.types';

/** HTTP 상태 경계 — 4xx/5xx 분류용. */
const STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_MIN: 500,
} as const;

/** 타임아웃 판정용 axios 에러 코드 (response가 없으므로 NETWORK보다 먼저 검사). */
const TIMEOUT_CODE = AxiosError.ECONNABORTED;

/** HTTP 상태 코드 → 정규화 사유. */
function reasonFromStatus(status: number): ApiErrorReason {
  if (status === STATUS.UNAUTHORIZED) return 'UNAUTHORIZED';
  if (status === STATUS.FORBIDDEN) return 'FORBIDDEN';
  if (status === STATUS.BAD_REQUEST) return 'BAD_REQUEST';
  if (status >= STATUS.SERVER_MIN) return 'SERVER';
  return 'UNKNOWN';
}

/** axios 에러에서 백엔드 봉투 `message`를 best-effort로 추출한다. */
function envelopeMessage(error: AxiosError): string | undefined {
  const data = error.response?.data as
    | { message?: unknown }
    | undefined;
  const message = data?.message;
  return typeof message === 'string' && message.length > 0
    ? message
    : undefined;
}

/**
 * axios 에러를 `ApiFailure`(`{ ok:false, reason, status?, message? }`)로 정규화해
 * `Promise.reject`한다. 응답 인터셉터의 에러 핸들러로 등록되어, 호출처는 항상
 * 동일한 Discriminated Union만 받게 된다.
 *
 * 판정 순서가 중요하다:
 * 1. axios 에러가 아니면 → UNKNOWN
 * 2. response가 있으면 → 상태 코드로 분류
 * 3. ECONNABORTED 코드면 → TIMEOUT (response가 없으므로 NETWORK보다 먼저)
 * 4. request만 있으면(응답 못 받음) → NETWORK
 * 5. 그 외 → UNKNOWN
 */
export function normalizeAxiosError(error: unknown): Promise<never> {
  if (!isAxiosError(error)) {
    const failure: ApiFailure = { ok: false, reason: 'UNKNOWN' };
    return Promise.reject(failure);
  }

  const message = envelopeMessage(error);

  if (error.response) {
    const { status } = error.response;
    const failure: ApiFailure = {
      ok: false,
      reason: reasonFromStatus(status),
      status,
      ...(message ? { message } : {}),
    };
    return Promise.reject(failure);
  }

  // ECONNABORTED는 response가 없으므로 NETWORK 판정보다 먼저 검사한다.
  if (error.code === TIMEOUT_CODE) {
    const failure: ApiFailure = {
      ok: false,
      reason: 'TIMEOUT',
      ...(message ? { message } : {}),
    };
    return Promise.reject(failure);
  }

  if (error.request) {
    const failure: ApiFailure = {
      ok: false,
      reason: 'NETWORK',
      ...(message ? { message } : {}),
    };
    return Promise.reject(failure);
  }

  const failure: ApiFailure = {
    ok: false,
    reason: 'UNKNOWN',
    ...(message ? { message } : {}),
  };
  return Promise.reject(failure);
}
