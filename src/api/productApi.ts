import { apiRequest } from '@/api/client';
import type { ProductKind } from '@/types';

export interface ProductResponse {
  productId: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  productKind: string;
  isSellableDirectly: boolean;
  isCustomSelectable: boolean;
  imageUrl?: string;
  size?: string;
  material?: string;
  flowerType?: string;
  status: string;
}

interface ProductListQuery {
  keyword?: string;
  categoryId?: number;
  productKind?: ProductKind;
  isSellableDirectly?: boolean;
  isCustomSelectable?: boolean;
  page?: number;
  limit?: number;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

export interface ProductUpsertRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  productKind: ProductKind;
  isSellableDirectly: boolean;
  isCustomSelectable: boolean;
  imageUrl?: string;
  size?: string;
  material?: string;
  flowerType?: string;
  status: string;
  image?: File;
  images?: File[];
}

function toProductFormData(payload: ProductUpsertRequest): FormData {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('price', String(payload.price));
  formData.append('categoryId', String(payload.categoryId));
  formData.append('productKind', payload.productKind.toUpperCase());
  formData.append('isSellableDirectly', String(payload.isSellableDirectly));
  formData.append('isCustomSelectable', String(payload.isCustomSelectable));
  formData.append('status', payload.status.toUpperCase());

  if (payload.size) formData.append('size', payload.size);
  if (payload.material) formData.append('material', payload.material);
  if (payload.flowerType) formData.append('flowerType', payload.flowerType);
  if (payload.imageUrl) formData.append('imageUrl', payload.imageUrl);
  if (payload.image) formData.append('imageFile', payload.image);
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach(image => {
      formData.append('imageFiles', image);
    });
  }

  return formData;
}

export function getPublicProducts(query: ProductListQuery = {}) {
  return apiRequest<ProductResponse[]>('/api/products', {
    query: {
      ...query,
      productKind: toBackendEnum(query.productKind),
    },
  });
}

export function getProductDetail(productId: number) {
  return apiRequest<ProductResponse>(`/api/products/${productId}`);
}

export function getCustomSelectableProducts(query: Omit<ProductListQuery, 'productKind' | 'isSellableDirectly' | 'isCustomSelectable'> = {}) {
  return apiRequest<ProductResponse[]>('/api/products/custom-selectable', { query });
}

export function getAdminProducts(query: ProductListQuery = {}) {
  return apiRequest<ProductResponse[]>('/api/admin/products', {
    query: {
      ...query,
      productKind: toBackendEnum(query.productKind),
    },
  });
}

export function createProduct(payload: ProductUpsertRequest) {
  return apiRequest<ProductResponse>('/api/admin/products', {
    method: 'POST',
    body: toProductFormData(payload),
  });
}

export function updateProduct(productId: number, payload: ProductUpsertRequest) {
  return apiRequest<ProductResponse>(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: toProductFormData(payload),
  });
}

export function deleteProduct(productId: number) {
  return apiRequest<void>(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
}
