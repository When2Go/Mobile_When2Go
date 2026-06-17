export type DevicePlatform = 'IOS' | 'ANDROID';

export interface UserStatusResponse {
  exists: boolean;
}

export interface UserRegisterRequest {
  deviceId: string;
  platform: DevicePlatform;
  fcmToken: string;
}

export interface UserResponse {
  userId: number;
  deviceId: string;
  platform: DevicePlatform;
  bufferMinutes: number;
  notificationMode: 'SOUND' | 'VIBRATE' | 'SOUND_AND_VIBRATE';
  widgetEnabled: boolean;
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
