import { api } from '@/api/axios';

import type {
  RegisterFcmTokenRequest,
  RegisterLiveActivityTokenRequest,
} from './types';

const FCM_TOKEN_PATH = '/api/users/me/fcm-token';
// ⚠️ 백엔드 협의 전 임시 경로. ActivityKit 푸시는 FCM 이 아닌 APNs 직접 전송이 필요해
//    별도 토큰을 저장한다. 엔드포인트 확정 시 이 상수만 갱신한다. (docs/references/live-activity.md)
const LIVE_ACTIVITY_TOKEN_PATH = '/api/users/me/live-activity-token';

export const registerFcmToken = (body: RegisterFcmTokenRequest) =>
  api.patch(FCM_TOKEN_PATH, body);

export const registerLiveActivityToken = (body: RegisterLiveActivityTokenRequest) =>
  api.patch(LIVE_ACTIVITY_TOKEN_PATH, body);
