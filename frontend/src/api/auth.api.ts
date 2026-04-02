import api from './axiosInstance';
import type { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '@/types';

export const authApi = {
  register: (data: RegisterCredentials) =>
    api.post<RegisterResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: LoginCredentials) =>
    api.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/api/auth/logout').then((r) => r.data),

  refresh: () =>
    api.post<LoginResponse>('/api/auth/refresh').then((r) => r.data),

  getProfile: () =>
    api.get<{ id: string; email: string; created_at: string }>('/api/auth/profile').then((r) => r.data),

  updateProfile: (data: { email?: string; current_password?: string; new_password?: string }) =>
    api.put<{ id: string; email: string; created_at: string }>('/api/auth/profile', data).then((r) => r.data),
};
