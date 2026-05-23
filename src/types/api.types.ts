/**
 * 백엔드 공통 응답 봉투 + 프론트 정규화 결과 타입.
 *
 * Spring Boot 백엔드는 성공/실패 모두 `{ success, data, message }` 형태로 응답한다
 * (`docs/references/api-schema.md` 공통 응답 봉투 참조). 프론트는 이 봉투와
 * axios 에러를 단일 Discriminated Union(`ApiResult`)으로 정규화해, 호출처가
 * 매번 응답 형태를 추론하지 않고 `ok` 한 가지만 확인하도록 한다
 * (`docs/FRONTEND.md` 함수 반환 타입 통일 / `docs/frontend-code-quality.md` 2-2).
 */

/**
 * 백엔드 응답 봉투. 성공/실패 공통 스키마이며 제네릭 `T`는 `data` 페이로드 타입.
 * 실패 시 `success: false`, `data: null`, `message`에 사용자용 사유가 담긴다.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

/**
 * 정규화된 실패 사유. HTTP 상태/네트워크 상황을 호출처가 분기하기 쉽도록
 * 의미 단위로 좁힌 enum 성격의 유니온.
 *
 * - `UNAUTHORIZED` : 401 (X-Device-Id 누락/미등록 등)
 * - `FORBIDDEN`    : 403
 * - `BAD_REQUEST`  : 400 (필드 누락·검증 실패)
 * - `SERVER`       : 5xx
 * - `NETWORK`      : 요청은 나갔으나 응답을 받지 못함 (오프라인 등)
 * - `TIMEOUT`      : 요청 타임아웃 (axios `ECONNABORTED`)
 * - `UNKNOWN`      : 위 어디에도 속하지 않는 분류 불가 에러
 */
export type ApiErrorReason =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'SERVER'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

/** 정규화 성공 결과. `data`는 봉투에서 꺼낸 실페이로드. */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

/**
 * 정규화 실패 결과.
 * - `status` : HTTP 응답이 있었던 경우의 상태 코드 (네트워크/타임아웃 시 없음)
 * - `message`: 백엔드 봉투 `message` 또는 axios 에러 메시지 (있으면 전달)
 */
export interface ApiFailure {
  ok: false;
  reason: ApiErrorReason;
  status?: number;
  message?: string;
}

/** 모든 API 호출이 호출처에 돌려주는 정규화 결과(Discriminated Union). */
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
