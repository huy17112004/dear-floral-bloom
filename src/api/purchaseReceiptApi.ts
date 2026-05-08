import { apiRequest } from '@/api/client';

export interface PurchaseReceiptItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseReceiptResponse {
  purchaseReceiptId: number;
  receiptCode: string;
  receiptDate: string;
  note?: string;
  items: PurchaseReceiptItemResponse[];
}

export interface CreatePurchaseReceiptItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseReceiptRequest {
  receiptDate: string;
  note?: string;
  items: CreatePurchaseReceiptItemRequest[];
}

export interface UpdatePurchaseReceiptRequest {
  receiptDate: string;
  note?: string;
  items: CreatePurchaseReceiptItemRequest[];
}

interface PurchaseReceiptQuery {
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export function createPurchaseReceipt(payload: CreatePurchaseReceiptRequest) {
  return apiRequest<PurchaseReceiptResponse>('/api/admin/purchase-receipts', {
    method: 'POST',
    body: payload,
  });
}

export function getPurchaseReceipts(query: PurchaseReceiptQuery = {}) {
  return apiRequest<PurchaseReceiptResponse[]>('/api/admin/purchase-receipts', { query });
}

export function updatePurchaseReceipt(receiptId: number, payload: UpdatePurchaseReceiptRequest) {
  return apiRequest<PurchaseReceiptResponse>(`/api/admin/purchase-receipts/${receiptId}`, {
    method: 'PUT',
    body: payload,
  });
}
