import { apiRequest } from '@/api/client';
import type { AvailableOrderStatus } from '@/types';

export interface AvailableOrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AvailableOrderResponse {
  orderId: number;
  orderCode: string;
  shippingReceiverName?: string;
  shippingReceiverPhone?: string;
  shippingAddressLine?: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingProvince?: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  orderedAt: string;
  items: AvailableOrderItemResponse[];
  rejectionReason?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
}

export interface CreateAvailableOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateAvailableOrderRequest {
  shippingAddressId: number;
  paymentMethod: string;
  transactionRef?: string;
  paymentProofUrl?: string;
  note?: string;
  items: CreateAvailableOrderItemRequest[];
}

interface AvailableOrderListQuery {
  keyword?: string;
  orderStatus?: AvailableOrderStatus;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface UpdateAvailableOrderStatusRequest {
  status: AvailableOrderStatus;
  reason?: string;
}

export interface ConfirmAvailableOrderPaymentRequest {
  transactionRef?: string;
  paymentProofUrl?: string;
}

export interface VerifyAvailableOrderPaymentRequest {
  received: boolean;
  note?: string;
}

export interface SubmitAvailableOrderRefundInfoRequest {
  refundBankName: string;
  refundAccountNumber: string;
  refundAccountName: string;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

export function createAvailableOrder(payload: CreateAvailableOrderRequest) {
  return apiRequest<AvailableOrderResponse>('/api/orders/available', {
    method: 'POST',
    body: payload,
  });
}

export function getMyAvailableOrders(query: AvailableOrderListQuery = {}) {
  return apiRequest<AvailableOrderResponse[]>('/api/orders/available/my-orders', {
    query,
  });
}

export function getAvailableOrderDetail(orderId: number) {
  return apiRequest<AvailableOrderResponse>(`/api/orders/available/${orderId}`);
}

export function getAdminAvailableOrders(query: AvailableOrderListQuery = {}) {
  return apiRequest<AvailableOrderResponse[]>('/api/admin/orders/available', {
    query: {
      ...query,
      orderStatus: toBackendEnum(query.orderStatus),
    },
  });
}

export function updateAdminAvailableOrderStatus(orderId: number, payload: UpdateAvailableOrderStatusRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/admin/orders/available/${orderId}/status`, {
    method: 'PATCH',
    body: {
      ...payload,
      status: toBackendEnum(payload.status),
    },
  });
}

export function confirmAvailableOrderPayment(orderId: number, payload: ConfirmAvailableOrderPaymentRequest = {}) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/orders/available/${orderId}/confirm-payment`, {
    method: 'POST',
    body: payload,
  });
}

export function verifyAvailableOrderPayment(orderId: number, payload: VerifyAvailableOrderPaymentRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/admin/orders/available/${orderId}/verify-payment`, {
    method: 'PATCH',
    body: payload,
  });
}

export function submitAvailableOrderRefundInfo(orderId: number, payload: SubmitAvailableOrderRefundInfoRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/orders/available/${orderId}/refund-info`, {
    method: 'POST',
    body: payload,
  });
}

export function confirmAvailableOrderRefund(orderId: number) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/admin/orders/available/${orderId}/confirm-refund`, {
    method: 'PATCH',
  });
}
