import axios, { type AxiosInstance } from 'axios';

import { attachDeviceId } from './interceptors/auth';
import { normalizeAxiosError } from './interceptors/error';

const REQUEST_TIMEOUT_MS = 10_000;

function resolveBaseURL(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL 가 비어있다. `cp .env.example .env` 후 백엔드 도메인을 채워라.',
    );
  }
  return url;
}

export const api: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: REQUEST_TIMEOUT_MS,
});

// 요청: 모든 요청에 X-Device-Id 자동 주입 — interceptors/auth.ts 로 분리.
api.interceptors.request.use(attachDeviceId);

// 응답: 에러를 ApiFailure 형태로 전역 정규화 — interceptors/error.ts 로 분리.
api.interceptors.response.use((response) => response, normalizeAxiosError);
