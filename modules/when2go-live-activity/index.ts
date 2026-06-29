import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

import type {
  ActivityPushTokenEvent,
  LiveActivityAttributes,
  LiveActivityContentState,
  PushToStartTokenEvent,
  When2GoLiveActivityModuleEvents,
} from './src/When2GoLiveActivity.types';

export type {
  ActivityPushTokenEvent,
  LiveActivityAttributes,
  LiveActivityContentState,
  PushToStartTokenEvent,
  When2GoLiveActivityModuleEvents,
};

interface NativeModule {
  areActivitiesEnabled(): boolean;
  isRunning(): boolean;
  start(
    attributes: LiveActivityAttributes,
    state: LiveActivityContentState,
  ): Promise<string | null>;
  update(state: LiveActivityContentState): Promise<void>;
  end(showFinalState: boolean): Promise<void>;
  registerForPushToStartToken(): void;
  addListener<K extends keyof When2GoLiveActivityModuleEvents>(
    eventName: K,
    listener: When2GoLiveActivityModuleEvents[K],
  ): EventSubscription;
}

// iOS 전용. Android/웹/시뮬레이터 일부 환경에서는 null 이므로 호출부에서 항상 가드한다.
const nativeModule = requireOptionalNativeModule<NativeModule>('When2GoLiveActivity');

/** 디바이스가 Live Activity 를 띄울 수 있는지(미지원 OS·설정 OFF 면 false). */
export function areActivitiesEnabled(): boolean {
  return nativeModule?.areActivitiesEnabled() ?? false;
}

/** 현재 출발 타이밍 Activity 가 떠 있는지. */
export function isRunning(): boolean {
  return nativeModule?.isRunning() ?? false;
}

/** 로컬에서 Activity 시작(포그라운드 폴백). 시작된 Activity id 반환, 미지원 시 null. */
export async function start(
  attributes: LiveActivityAttributes,
  state: LiveActivityContentState,
): Promise<string | null> {
  if (!nativeModule) return null;
  return nativeModule.start(attributes, state);
}

/** 동적 상태 갱신. */
export async function update(state: LiveActivityContentState): Promise<void> {
  await nativeModule?.update(state);
}

/** Activity 종료. showFinalState=false 면 즉시 사라진다(위젯 끄기). */
export async function end(showFinalState = false): Promise<void> {
  await nativeModule?.end(showFinalState);
}

/** push-to-start 토큰 구독 시작(iOS 17.2+). */
export function registerForPushToStartToken(): void {
  nativeModule?.registerForPushToStartToken();
}

/** push-to-start 토큰 수신 구독. */
export function addPushToStartTokenListener(
  listener: (event: PushToStartTokenEvent) => void,
): EventSubscription | undefined {
  return nativeModule?.addListener('onPushToStartToken', listener);
}

/** Activity 별 업데이트 토큰 수신 구독. */
export function addActivityPushTokenListener(
  listener: (event: ActivityPushTokenEvent) => void,
): EventSubscription | undefined {
  return nativeModule?.addListener('onActivityPushToken', listener);
}

/** 시스템/사용자에 의해 Activity 가 끝났을 때 구독. */
export function addActivityEndListener(
  listener: () => void,
): EventSubscription | undefined {
  return nativeModule?.addListener('onActivityEnd', listener);
}

/** 네이티브 모듈 자체가 링크돼 있는지(iOS 빌드 여부). */
export const isSupported = nativeModule != null;
