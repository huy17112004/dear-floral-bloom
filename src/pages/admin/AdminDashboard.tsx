import { useEffect, useMemo, useState } from 'react';
import { StatisticCard } from '@/components/shared/StatisticCard';
import { Package, ShoppingCart, DollarSign, Palette, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminCustomOrderApi, reportApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import type { CustomOrder } from '@/types';
import type { OverviewReportResponse, RevenueReportItemResponse } from '@/api/reportApi';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewReportResponse>({
    totalProducts: 0,
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
  });
  const [revenueItems, setRevenueItems] = useState<RevenueReportItemResponse[]>([]);
  const [recentCustom, setRecentCustom] = useState<CustomOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, revenueRes, customRes] = await Promise.all([
          reportApi.getReportOverview(),
          reportApi.getRevenueReport({ groupBy: 'MONTH' }),
          adminCustomOrderApi.getAdminCustomOrders({ page: 0, limit: 3 }),
        ]);

        setOverview(overviewRes.data ?? {
          totalProducts: 0,
          totalOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
        });
        setRevenueItems(Array.isArray(revenueRes.data) ? revenueRes.data : []);
        setRecentCustom(Array.isArray(customRes.data) ? customRes.data.map(mapCustomOrder) : []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu dashboard';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const revenueChartData = useMemo(
    () =>
      (Array.isArray(revenueItems) ? revenueItems : []).map(item => ({
        period: item.bucketDate,
        revenue: Number(item.totalRevenue ?? 0),
      })),
    [revenueItems]
  );

  const totalRevenue = revenueChartData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatisticCard title="Sản phẩm" value={overview.totalProducts} icon={Package} />
        <StatisticCard title="Đơn hàng" value={overview.totalOrders} icon={ShoppingCart} />
        <StatisticCard title="Đang xử lý" value={overview.processingOrders} icon={TrendingUp} />
        <StatisticCard title="Hoàn thành" value={overview.completedOrders} icon={ShoppingCart} />
        <StatisticCard title="Đơn Custom" value={recentCustom.length} icon={Palette} />
        <StatisticCard title="Doanh thu" value={`${(totalRevenue / 1000000).toFixed(1)}M`} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-heading text-base">Doanh thu theo tháng</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 88%)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number | string) => [
                    `${Number(value ?? 0).toLocaleString('vi-VN')}₫`,
                    'Doanh thu',
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(90 15% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Đơn hàng thường gần đây</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-caption">
              Chưa hiển thị vì backend chưa có API danh sách đơn hàng thường quản trị.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Đơn hàng custom gần đây</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentCustom.length === 0 && (
              <p className="text-sm text-caption">Chưa có đơn custom gần đây.</p>
            )}
            {recentCustom.map(order => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-surface-warm p-3">
                <div>
                  <span className="text-sm font-medium text-heading">{order.orderCode}</span>
                  <p className="text-xs text-caption">{order.flowerType}</p>
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
