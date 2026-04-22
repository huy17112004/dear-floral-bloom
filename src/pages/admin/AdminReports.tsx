import { useEffect, useMemo, useState } from 'react';
import { StatisticCard } from '@/components/shared/StatisticCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, Warehouse } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { reportApi } from '@/api';
import type { OverviewReportResponse, RevenueReportItemResponse } from '@/api/reportApi';
import { toast } from 'sonner';

export default function AdminReports() {
  const [overview, setOverview] = useState<OverviewReportResponse>({
    totalProducts: 0,
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
  });
  const [revenueItems, setRevenueItems] = useState<RevenueReportItemResponse[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, revenueRes] = await Promise.all([
          reportApi.getReportOverview(),
          reportApi.getRevenueReport({ groupBy: 'MONTH' }),
        ]);

        setOverview(overviewRes.data);
        setRevenueItems(revenueRes.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải báo cáo';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const chartData = useMemo(
    () =>
      revenueItems.map(item => ({
        period: item.bucketDate,
        revenue: item.totalRevenue,
        orderCount: 0,
      })),
    [revenueItems]
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Báo cáo & Thống kê</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard title="Tổng sản phẩm" value={overview.totalProducts} icon={Package} />
        <StatisticCard title="Tổng đơn hàng" value={overview.totalOrders} icon={ShoppingCart} />
        <StatisticCard title="Doanh thu" value={`${(chartData.reduce((sum, item) => sum + item.revenue, 0) / 1000000).toFixed(1)}M₫`} icon={DollarSign} />
        <StatisticCard title="Đang xử lý" value={overview.processingOrders} icon={Warehouse} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Doanh thu theo tháng</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']} />
                  <Bar dataKey="revenue" fill="hsl(90 15% 55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Số đơn hàng theo tháng</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orderCount" stroke="hsl(30 35% 65%)" strokeWidth={2} dot={{ fill: 'hsl(30 35% 65%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
