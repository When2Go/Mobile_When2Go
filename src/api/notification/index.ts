import { api } from '@/api/axios';

import type { RegisterFcmTokenRequest } from './types';

const FCM_TOKEN_PATH = '/api/users/me/fcm-token';

export const registerFcmToken = (body: RegisterFcmTokenRequest) =>
  api.post(FCM_TOKEN_PATH, body);
