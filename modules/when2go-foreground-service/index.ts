import { requireOptionalNativeModule } from 'expo-modules-core';

import type {
  ForegroundServiceAttributes,
  ForegroundServiceState,
} from './src/When2GoForegroundService.types';

export type {
  ForegroundServiceAttributes,
  ForegroundServicePayload,
  ForegroundServiceState,
} from './src/When2GoForegroundService.types';

interface NativeModule {
  isRunning(): boolean;
  start(
    attributes: ForegroundServiceAttributes,
    state: ForegroundServiceState,
  ): Promise<void>;
  update(state: ForegroundServiceState): Promise<void>;
  stop(): Promise<void>;
}

// Android 전용. iOS/웹/미빌드 환경에서는 null 이므로 호출부에서 항상 가드한다.
const nativeModule = requireOptionalNativeModule<NativeModule>('When2GoForegroundService');

/** 현재 출발 타이밍 Foreground Service 가 떠 있는지. */
export function isRunning(): boolean {
  return nativeModule?.isRunning() ?? false;
}

/** Foreground Service + Ongoing Notification 시작. 미지원(iOS 등) 시 no-op. */
export async function start(
  attributes: ForegroundServiceAttributes,
  state: ForegroundServiceState,
): Promise<void> {
  await nativeModule?.start(attributes, state);
}

/** 동적 상태 갱신(알림 갱신). */
export async function update(state: ForegroundServiceState): Promise<void> {
  await nativeModule?.update(state);
}

/** Service 종료 + 알림 제거(위젯 끄기 / 첫 대중교통 탑승 시점). */
export async function stop(): Promise<void> {
  await nativeModule?.stop();
}

/** 네이티브 모듈 자체가 링크돼 있는지(Android 빌드 여부). */
export const isSupported = nativeModule != null;
