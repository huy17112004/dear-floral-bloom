import { apiRequest } from '@/api/client';

export interface CategoryResponse {
  categoryId: number;
  name: string;
  description?: string;
  status: string;
}

export interface CategoryUpsertRequest {
  name: string;
  description?: string;
  status: string;
}

export function getPublicCategories() {
  return apiRequest<CategoryResponse[]>('/api/categories');
}

export function getAdminCategories() {
  return apiRequest<CategoryResponse[]>('/api/admin/categories');
}

export function createCategory(payload: CategoryUpsertRequest) {
  return apiRequest<CategoryResponse>('/api/admin/categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateCategory(categoryId: number, payload: CategoryUpsertRequest) {
  return apiRequest<CategoryResponse>(`/api/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteCategory(categoryId: number) {
  return apiRequest<void>(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
  });
}
