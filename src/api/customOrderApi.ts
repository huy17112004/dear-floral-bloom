import { apiRequest } from '@/api/client';

export interface CustomOrderResponse {
  id: number;
  orderCode: string;
  selectedFrameProductId: number;
  selectedFrameName?: string;
  shippingReceiverName?: string;
  shippingReceiverPhone?: string;
  shippingAddressLine?: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingProvince?: string;
  orderStatus: string;
  paymentStatus: string;
  depositAmount: number;
  remainingAmount: number;
  totalAmount: number;
  flowerType: string;
  personalizationContent?: string;
  requestedDeliveryDate?: string;
  flowerInputImageUrl?: string;
  flowerEvaluationStatus?: string;
  flowerEvaluationNote?: string;
  rejectionReason?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
  demoRevisionCount?: number;
  extraRevisionFeeRate?: number;
  orderedAt?: string;
}

export interface CustomDemoResponse {
  demoId: number;
  orderId: number;
  versionNo: number;
  demoImageUrl: string;
  demoImages?: string[];
  demoDescription?: string;
  customerResponseStatus?: string;
  customerFeedback?: string;
  uploadedAt?: string;
  respondedAt?: string;
}

interface PaginatedQuery {
  page?: number;
  limit?: number;
}

export interface CreateCustomOrderRequest {
  selectedFrameProductId: number;
  flowerType: string;
  personalizationContent: string;
  requestedDeliveryDate?: string;
  flowerInputImage?: string;
  shippingAddressId?: number;
  shippingAddressObject?: unknown;
  depositPaymentMethod: string;
  depositTransactionRef?: string;
  depositPaymentProof?: string;
}

export interface CreateCustomOrderResponse {
  orderId: number;
  orderCode: string;
  depositStatus: string;
  paymentStatus: string;
}

export interface CreateRemainingPaymentRequest {
  paymentMethod: string;
  transactionRef?: string;
  paymentProof?: string;
}

export interface RemainingPaymentResponse {
  paymentStatus: string;
  remainingAmount: number;
}

export interface DemoFeedbackRequest {
  action: 'approve' | 'request_revision';
  feedback?: string;
}

export interface DemoFeedbackResponse {
  currentOrderStatus: string;
  revisionCount: number;
}

export interface SubmitRefundInfoRequest {
  refundBankName: string;
  refundAccountNumber: string;
  refundAccountName: string;
}

export function createCustomOrder(payload: CreateCustomOrderRequest) {
  return apiRequest<CreateCustomOrderResponse>('/api/orders/custom', {
    method: 'POST',
    body: payload,
  });
}

export function confirmDepositTransfer(orderId: number) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(
    `/api/orders/custom/${orderId}/confirm-deposit`,
    { method: 'POST' },
  );
}

export function getMyCustomOrders(query: PaginatedQuery = {}) {
  return apiRequest<CustomOrderResponse[]>('/api/orders/custom/my-orders', { query });
}

export function getCustomOrderDetail(orderId: number) {
  return apiRequest<CustomOrderResponse>(`/api/orders/custom/${orderId}`);
}

export function payCustomOrderRemaining(orderId: number, payload: CreateRemainingPaymentRequest) {
  return apiRequest<RemainingPaymentResponse>(`/api/orders/custom/${orderId}/remaining-payment`, {
    method: 'POST',
    body: payload,
  });
}

export function getCustomOrderDemos(orderId: number) {
  return apiRequest<CustomDemoResponse[]>(`/api/orders/custom/${orderId}/demos`);
}

export function feedbackCustomOrderDemo(orderId: number, demoId: number, payload: DemoFeedbackRequest) {
  return apiRequest<DemoFeedbackResponse>(`/api/orders/custom/${orderId}/demos/${demoId}/feedback`, {
    method: 'POST',
    body: {
      ...payload,
      action: payload.action.toUpperCase(),
    },
  });
}

export function submitCustomOrderRefundInfo(orderId: number, payload: SubmitRefundInfoRequest) {
  return apiRequest<{ orderId: number; orderCode: string; status: string }>(`/api/orders/custom/${orderId}/refund-info`, {
    method: 'POST',
    body: payload,
  });
}
