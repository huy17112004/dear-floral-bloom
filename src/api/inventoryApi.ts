import { apiRequest } from '@/api/client';
import type { ProductKind } from '@/types';

export interface InventoryItemResponse {
  productId: number;
  productName: string;
  productKind: string;
  isSellableDirectly: boolean;
  isCustomSelectable: boolean;
  quantityOnHand: number;
}

interface InventoryQuery {
  productKind?: ProductKind;
  isSellableDirectly?: boolean;
  isCustomSelectable?: boolean;
  keyword?: string;
  page?: number;
  limit?: number;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

export function getInventory(query: InventoryQuery = {}) {
  return apiRequest<InventoryItemResponse[]>('/api/admin/inventory', {
    query: {
      ...query,
      productKind: toBackendEnum(query.productKind),
    },
  });
}
