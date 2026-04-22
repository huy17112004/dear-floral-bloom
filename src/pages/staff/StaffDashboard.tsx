import { useEffect, useState } from 'react';
import { AlertTriangle, ClipboardList, Package, Flower, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatisticCard } from '@/components/shared/StatisticCard';
import { dashboardApi } from '@/api';
import type { LowInventoryProductResponse, RecentOrderResponse, StaffDashboardResponse } from '@/api/dashboardApi';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState<StaffDashboardResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await dashboardApi.getStaffDashboard();
        setDashboard(response.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dashboard nhân viên';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const lowStock: LowInventoryProductResponse[] = dashboard?.lowInventoryProducts ?? [];
  const recentOrders: RecentOrderResponse[] = dashboard?.recentOrdersToday ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Tổng quan công việc</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard title="Đơn mới hôm nay" value={recentOrders.length} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatisticCard title="Đang xử lý" value={dashboard?.pendingAvailableOrders ?? 0} icon={<ClipboardList className="h-5 w-5" />} />
        <StatisticCard title="Tồn kho thấp" value={lowStock.length} icon={<Package className="h-5 w-5" />} />
        <StatisticCard title="Chờ đánh giá hoa" value={dashboard?.pendingCustomOrders ?? 0} icon={<Flower className="h-5 w-5" />} />
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo tồn kho thấp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(item => {
                return (
                  <div key={item.productId} className="flex items-center justify-between rounded-lg border border-orange-200 bg-white px-4 py-2">
                    <span className="text-sm font-medium">{item.productName || item.productId}</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Còn {item.quantityOnHand}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent available orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng thường mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map(order => (
                <div key={order.orderId} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{order.orderCode}</p>
                    <p className="text-xs text-muted-foreground">{order.orderedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="availableOrder" status={order.orderStatus.toLowerCase()} />
                    <span className="text-sm font-medium">{Number(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom orders needing attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn custom cần xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentOrders.filter(o => o.orderDomain.toLowerCase() === 'custom')).slice(0, 5).map(order => (
                <div key={order.orderId} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{order.orderCode}</p>
                    <p className="text-xs text-muted-foreground">Đơn custom</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="customOrder" status={order.orderStatus.toLowerCase()} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
