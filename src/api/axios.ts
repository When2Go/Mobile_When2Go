import axios, { type AxiosInstance } from 'axios';

import { useDeviceStore } from '@/stores/deviceStore';

const DEVICE_ID_HEADER = 'X-Device-Id';
const REQUEST_TIMEOUT_MS = 10_000;

function resolveBaseURL(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL 가 비어있다. .env.example 을 .env 로 복사하고 EC2 URL 을 채워라.',
    );
  }
  return url;
}

export const api: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: REQUEST_TIMEOUT_MS,
});

// 모든 요청에 X-Device-Id 자동 주입 — docs/FRONTEND.md §5 규약
api.interceptors.request.use((config) => {
  const deviceId = useDeviceStore.getState().deviceId;
  if (deviceId) {
    config.headers[DEVICE_ID_HEADER] = deviceId;
  }
  return config;
});
