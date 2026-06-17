import { api } from '@/api/axios';

import type {
  ApiEnvelope,
  UserRegisterRequest,
  UserResponse,
  UserStatusResponse,
} from './types';

const USER_STATUS_PATH = '/api/users/status';
const USER_REGISTER_PATH = '/api/users';

export const getUserStatus = async (): Promise<UserStatusResponse> => {
  const { data } = await api.get<ApiEnvelope<UserStatusResponse>>(USER_STATUS_PATH);
  return data.data;
};

export const registerUser = async (body: UserRegisterRequest): Promise<UserResponse> => {
  const { data } = await api.post<ApiEnvelope<UserResponse>>(USER_REGISTER_PATH, body);
  return data.data;
};
