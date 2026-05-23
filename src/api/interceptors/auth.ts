import type { InternalAxiosRequestConfig } from 'axios';

import { useDeviceStore } from '@/stores/deviceStore';

/**
 * 디바이스 식별 헤더명. 백엔드는 모든 요청에서 이 헤더로 사용자를 식별한다
 * (`docs/references/api-schema.md` 인증 헤더 / `docs/FRONTEND.md` §5).
 */
export const DEVICE_ID_HEADER = 'X-Device-Id';

/**
 * 요청 인터셉터: deviceStore에 deviceId가 있으면 `X-Device-Id` 헤더를 주입한다.
 * deviceId가 아직 없으면(첫 부트스트랩 전) config를 변형 없이 그대로 통과시키며,
 * 기존 헤더는 항상 보존한다.
 *
 * axios.ts에 인라인돼 있던 로직을 단위 테스트 가능하도록 분리한 것.
 */
export function attachDeviceId(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const { deviceId } = useDeviceStore.getState();
  if (deviceId) {
    config.headers[DEVICE_ID_HEADER] = deviceId;
  }
  return config;
}
