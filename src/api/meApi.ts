import { apiRequest } from '@/api/client';

export interface ProfileResponse {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
}

export interface AddressResponse {
  addressId: number;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  note?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  email: string;
}

export interface UpsertAddressRequest {
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  note?: string;
}

export function getMyProfile() {
  return apiRequest<ProfileResponse>('/api/me');
}

export function updateMyProfile(payload: UpdateProfileRequest) {
  return apiRequest<ProfileResponse>('/api/me', {
    method: 'PUT',
    body: payload,
  });
}

export function getMyAddresses() {
  return apiRequest<AddressResponse[]>('/api/me/addresses');
}

export function createAddress(payload: UpsertAddressRequest) {
  return apiRequest<AddressResponse>('/api/me/addresses', {
    method: 'POST',
    body: payload,
  });
}

export function updateAddress(addressId: number, payload: UpsertAddressRequest) {
  return apiRequest<AddressResponse>(`/api/me/addresses/${addressId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteAddress(addressId: number) {
  return apiRequest<void>(`/api/me/addresses/${addressId}`, {
    method: 'DELETE',
  });
}
