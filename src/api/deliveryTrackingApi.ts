import { apiRequest } from '@/api/client';

export interface DeliveryTrackingResponse {
  trackingType: string;
  trackingRecordId: number;
  orderId: number;
  orderCode: string;
  deliveryType?: string;
  deliveryStatus: string;
  customerAddress: string;
  orderedAt?: string;
  eventTime?: string;
  receiverNote?: string;
}

interface DeliveryTrackingQuery {
  deliveryStatus?: string;
  page?: number;
  limit?: number;
}

export function getDeliveryTrackingRecords(query: DeliveryTrackingQuery = {}) {
  return apiRequest<DeliveryTrackingResponse[]>('/api/staff/delivery-tracking', {
    query,
  });
}
