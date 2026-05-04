import { apiRequest } from '@/api/client';
import type { CustomOrderStatus } from '@/types';
import type { CustomOrderResponse, CustomDemoResponse } from '@/api/customOrderApi';

interface AdminCustomOrderListQuery {
  keyword?: string;
  orderStatus?: CustomOrderStatus;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface UpdateCustomOrderStatusRequest {
  status: CustomOrderStatus;
  reason?: string;
}

export interface EvaluateFlowerInputRequest {
  evaluationStatus: 'pass' | 'fail';
  evaluationNote?: string;
}

export interface UpdateCustomDeliveryRequest {
  deliveryType: 'pickup_input' | 'ship_output';
  deliveryStatus: string;
  deliveryNote?: string;
  deliveryTime?: string;
}

export interface CreateCustomDemoRequest {
  demoImage?: string;
  demoImageFile?: File;
  demoImageFiles?: File[];
  demoImages?: string[];
  demoDescription?: string;
}

export interface VerifyRemainingPaymentRequest {
  received: boolean;
  note?: string;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

export function getAdminCustomOrders(query: AdminCustomOrderListQuery = {}) {
  return apiRequest<CustomOrderResponse[]>('/api/admin/orders/custom', {
    query: {
      ...query,
      orderStatus: toBackendEnum(query.orderStatus),
    },
  });
}

export function updateAdminCustomOrderStatus(orderId: number, payload: UpdateCustomOrderStatusRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/admin/orders/custom/${orderId}/status`, {
    method: 'PATCH',
    body: {
      ...payload,
      status: toBackendEnum(payload.status),
    },
  });
}

export function verifyCustomOrderDeposit(orderId: number, accepted: boolean) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(
    `/api/admin/orders/custom/${orderId}/verify-deposit`,
    { method: 'PATCH', body: { accepted } },
  );
}

export function evaluateCustomOrderFlowerInput(orderId: number, payload: EvaluateFlowerInputRequest) {
  return apiRequest<{ orderId: number; flowerEvaluationStatus: string; nextStep: string }>(
    `/api/admin/orders/custom/${orderId}/evaluate-flower-input`,
    {
      method: 'PATCH',
      body: {
        ...payload,
        evaluationStatus: toBackendEnum(payload.evaluationStatus),
      },
    }
  );
}

export function updateAdminCustomOrderDelivery(orderId: number, payload: UpdateCustomDeliveryRequest) {
  return apiRequest<{
    orderId: number;
    orderCode: string;
    deliveryType: string;
    deliveryStatus: string;
    deliveryNote?: string;
    pickupTime?: string;
    shippedTime?: string;
    deliveredTime?: string;
  }>(`/api/admin/orders/custom/${orderId}/delivery`, {
    method: 'PATCH',
    body: payload,
  });
}

export function uploadAdminCustomOrderDemo(orderId: number, payload: CreateCustomDemoRequest) {
  const formData = new FormData();
  if (payload.demoImage) formData.append('demoImage', payload.demoImage);
  if (payload.demoImageFile) formData.append('demoImageFile', payload.demoImageFile);
  if (payload.demoImageFiles && payload.demoImageFiles.length > 0) {
    payload.demoImageFiles.forEach(file => formData.append('demoImageFiles', file));
  }
  if (payload.demoImages && payload.demoImages.length > 0) {
    payload.demoImages.forEach(image => formData.append('demoImages', image));
  }
  if (payload.demoDescription) formData.append('demoDescription', payload.demoDescription);

  return apiRequest<CustomDemoResponse>(`/api/admin/orders/custom/${orderId}/demos`, {
    method: 'POST',
    body: formData,
  });
}

export function confirmCustomOrderRefund(orderId: number) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/admin/orders/custom/${orderId}/confirm-refund`, {
    method: 'PATCH',
  });
}

export function verifyCustomOrderRemainingPayment(orderId: number, payload: VerifyRemainingPaymentRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(
    `/api/admin/orders/custom/${orderId}/verify-remaining-payment`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}
