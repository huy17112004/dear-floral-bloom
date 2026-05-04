import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Warehouse } from 'lucide-react';
import { StatisticCard } from '@/components/shared/StatisticCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminCustomOrderApi, availableOrderApi, reportApi } from '@/api';
import { mapCustomOrder, mapAvailableOrder } from '@/api/mappers';
import type { AvailableOrder, CustomOrder } from '@/types';
import type { InventoryReportItem, OrderStatisticItem, OverviewReportResponse, RevenueReportItemResponse } from '@/api/reportApi';
import { toast } from 'sonner';

const MONEY = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewReportResponse>({
    totalProducts: 0,
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
  });
  const [revenueItems, setRevenueItems] = useState<RevenueReportItemResponse[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStatisticItem[]>([]);
  const [lowInventoryItems, setLowInventoryItems] = useState<InventoryReportItem[]>([]);
  const [recentAvailableOrders, setRecentAvailableOrders] = useState<AvailableOrder[]>([]);
  const [recentCustomOrders, setRecentCustomOrders] = useState<CustomOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          overviewRes,
          revenueRes,
          orderStatsRes,
          inventoryRes,
          availableRes,
          customRes,
        ] = await Promise.all([
          reportApi.getReportOverview(),
          reportApi.getRevenueReport({ groupBy: 'MONTH' }),
          reportApi.getOrderReport({ orderDomain: 'ALL' }),
          reportApi.getInventoryReport(),
          availableOrderApi.getAdminAvailableOrders({ page: 0, limit: 5 }),
          adminCustomOrderApi.getAdminCustomOrders({ page: 0, limit: 5 }),
        ]);

        setOverview(overviewRes.data ?? {
          totalProducts: 0,
          totalOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
        });
        setRevenueItems(Array.isArray(revenueRes.data) ? revenueRes.data : []);
        setOrderStats(Array.isArray(orderStatsRes.data) ? orderStatsRes.data : []);
        setLowInventoryItems(
          (Array.isArray(inventoryRes.data) ? inventoryRes.data : [])
            .filter(item => Number(item.quantityOnHand ?? 0) <= 5)
            .sort((a, b) => Number(a.quantityOnHand) - Number(b.quantityOnHand))
            .slice(0, 6)
        );
        setRecentAvailableOrders(Array.isArray(availableRes.data) ? availableRes.data.map(mapAvailableOrder) : []);
        setRecentCustomOrders(Array.isArray(customRes.data) ? customRes.data.map(mapCustomOrder) : []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu tổng quan quản trị';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const totalRevenue = useMemo(
    () => revenueItems.reduce((sum, item) => sum + Number(item.totalRevenue ?? 0), 0),
    [revenueItems]
  );

  const revenueChartData = useMemo(
    () => revenueItems.map(item => ({
      period: item.bucketDate,
      availableRevenue: Number(item.availableRevenue ?? 0),
      customRevenue: Number(item.customRevenue ?? 0),
      totalRevenue: Number(item.totalRevenue ?? 0),
    })),
    [revenueItems]
  );

  const groupedOrderStats = useMemo(() => {
    const available = orderStats.filter(item => item.orderDomain === 'AVAILABLE');
    const custom = orderStats.filter(item => item.orderDomain === 'CUSTOM');
    return { available, custom };
  }, [orderStats]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Tổng quan quản trị</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatisticCard title="Tổng sản phẩm" value={overview.totalProducts} icon={Package} />
        <StatisticCard title="Tổng đơn hàng" value={overview.totalOrders} icon={ShoppingCart} />
        <StatisticCard title="Đơn đang xử lý" value={overview.processingOrders} icon={TrendingUp} />
        <StatisticCard title="Đơn đã hoàn thành" value={overview.completedOrders} icon={ShoppingCart} />
        <StatisticCard title="Tổng doanh thu" value={MONEY(totalRevenue)} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueChartData.length === 0 ? (
            <p className="text-sm text-caption">Chưa có dữ liệu doanh thu.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={value => `${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip
                    formatter={(value: number | string, name) => [MONEY(Number(value ?? 0)), name]}
                    labelFormatter={label => `Kỳ: ${label}`}
                  />
                  <Bar dataKey="availableRevenue" name="Đơn thường" fill="hsl(92 24% 46%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="customRevenue" name="Đơn custom" fill="hsl(33 72% 56%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái đơn thường</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedOrderStats.available.length === 0 && <p className="text-sm text-caption">Chưa có dữ liệu.</p>}
            {groupedOrderStats.available.map(item => (
              <div key={`available-${item.orderStatus}`} className="flex items-center justify-between rounded-lg border p-3">
                <StatusBadge type="availableOrder" status={item.orderStatus.toLowerCase()} />
                <span className="text-sm font-medium">{item.totalOrders}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái đơn custom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedOrderStats.custom.length === 0 && <p className="text-sm text-caption">Chưa có dữ liệu.</p>}
            {groupedOrderStats.custom.map(item => (
              <div key={`custom-${item.orderStatus}`} className="flex items-center justify-between rounded-lg border p-3">
                <StatusBadge type="customOrder" status={item.orderStatus.toLowerCase()} />
                <span className="text-sm font-medium">{item.totalOrders}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Warehouse className="h-4 w-4" />
              Cảnh báo tồn kho thấp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowInventoryItems.length === 0 && <p className="text-sm text-caption">Không có sản phẩm tồn kho thấp.</p>}
            {lowInventoryItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm">{item.productName}</span>
                <span className="text-sm font-medium">{item.quantityOnHand}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Đơn thường gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAvailableOrders.length === 0 && <p className="text-sm text-caption">Chưa có đơn thường.</p>}
            {recentAvailableOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{order.orderCode}</p>
                  <p className="text-xs text-caption">{MONEY(order.totalAmount)}</p>
                </div>
                <StatusBadge type="availableOrder" status={order.orderStatus} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Đơn custom gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomOrders.length === 0 && <p className="text-sm text-caption">Chưa có đơn custom.</p>}
            {recentCustomOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{order.orderCode}</p>
                  <p className="text-xs text-caption">{MONEY(order.totalAmount)}</p>
                </div>
                <StatusBadge type="customOrder" status={order.orderStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
