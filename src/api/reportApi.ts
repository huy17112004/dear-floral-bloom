import { apiRequest } from '@/api/client';
import type { ProductKind } from '@/types';

type GroupBy = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
type OrderDomain = 'ALL' | 'AVAILABLE' | 'CUSTOM';

interface DateRangeQuery {
  fromDate?: string;
  toDate?: string;
}

export interface OrderStatisticItem {
  orderDomain: string;
  orderStatus: string;
  totalOrders: number;
}

export interface InventoryReportItem {
  productId: number;
  productName: string;
  productKind: string;
  quantityOnHand: number;
  updatedAt: string;
}

export interface OverviewReportResponse {
  totalProducts: number;
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
}

export interface RevenueReportItemResponse {
  bucketDate: string;
  availableRevenue: number;
  customRevenue: number;
  totalRevenue: number;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

export function getReportOverview(query: DateRangeQuery = {}) {
  return apiRequest<OverviewReportResponse>('/api/admin/reports/overview', { query });
}

export function getRevenueReport(query: DateRangeQuery & { groupBy?: GroupBy } = {}) {
  return apiRequest<RevenueReportItemResponse[]>('/api/admin/reports/revenue', { query });
}

export function getOrderReport(query: DateRangeQuery & { orderDomain?: OrderDomain } = {}) {
  return apiRequest<OrderStatisticItem[]>('/api/admin/reports/orders', { query });
}

export function getInventoryReport(query: { productKind?: ProductKind } = {}) {
  return apiRequest<InventoryReportItem[]>('/api/admin/reports/inventory', {
    query: {
      ...query,
      productKind: toBackendEnum(query.productKind),
    },
  });
}
