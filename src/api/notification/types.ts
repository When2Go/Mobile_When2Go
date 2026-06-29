export interface RegisterFcmTokenRequest {
  fcmToken: string;
}

/** Live Activity 푸시 토큰 종류 — push-to-start(시작) vs per-activity(갱신/종료). */
export type LiveActivityTokenKind = 'PUSH_TO_START' | 'ACTIVITY';

export interface RegisterLiveActivityTokenRequest {
  /** ActivityKit 푸시 토큰(hex). APNs 직접 전송용. */
  liveActivityToken: string;
  kind: LiveActivityTokenKind;
  /** kind 가 ACTIVITY 일 때 해당 Activity 식별자. */
  activityId?: string;
}
