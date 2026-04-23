import { apiRequest } from '@/api/client';

export interface AdminUserResponse {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserListQuery {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateAdminUserRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER' | string;
  status?: string;
}

export interface UpdateAdminUserRequest {
  fullName: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER' | string;
  status: string;
  password?: string;
}

function normalizeEnum(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.trim().toUpperCase();
}

export function getAdminUsers(query: UserListQuery = {}) {
  return apiRequest<AdminUserResponse[]>('/api/admin/users', {
    query,
  });
}

export function createAdminUser(payload: CreateAdminUserRequest) {
  return apiRequest<AdminUserResponse>('/api/admin/users', {
    method: 'POST',
    body: {
      ...payload,
      role: normalizeEnum(payload.role),
      status: normalizeEnum(payload.status),
    },
  });
}

export function updateAdminUser(userId: number, payload: UpdateAdminUserRequest) {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: {
      ...payload,
      role: normalizeEnum(payload.role),
      status: normalizeEnum(payload.status),
    },
  });
}

export function deleteAdminUser(userId: number) {
  return apiRequest<void>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}
