import { apiRequest } from '@/api/client';

export interface LowInventoryProductResponse {
  productId: number;
  productName: string;
  productKind: string;
  quantityOnHand: number;
}

export interface RecentOrderResponse {
  orderDomain: string;
  orderId: number;
  orderCode: string;
  orderStatus: string;
  totalAmount: number;
  orderedAt: string;
}

export interface StaffDashboardResponse {
  pendingAvailableOrders: number;
  pendingCustomOrders: number;
  demosPendingApproval: number;
  lowInventoryProducts: LowInventoryProductResponse[];
  recentOrdersToday: RecentOrderResponse[];
}

export function getStaffDashboard() {
  return apiRequest<StaffDashboardResponse>('/api/staff/dashboard');
}
