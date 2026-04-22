import { apiRequest } from '@/api/client';

export interface UpdateAvailableDeliveryRequest {
  deliveryStatus: string;
  deliveryNote?: string;
  deliveryTime?: string;
}

export interface AvailableDeliveryResponse {
  orderId: number;
  orderCode: string;
  deliveryStatus: string;
  deliveryNote?: string;
  shippedTime?: string;
  deliveredTime?: string;
}

export function updateAvailableOrderDelivery(orderId: number, payload: UpdateAvailableDeliveryRequest) {
  return apiRequest<AvailableDeliveryResponse>(`/api/admin/orders/available/${orderId}/delivery`, {
    method: 'PATCH',
    body: payload,
  });
}
