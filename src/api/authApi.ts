import { apiRequest } from '@/api/client';

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  userProfile?: unknown;
  role?: string;
}

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function logout() {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  });
}

