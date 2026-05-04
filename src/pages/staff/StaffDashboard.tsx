import { useEffect, useState } from 'react';
import { AlertTriangle, ClipboardList, Flower, MessageSquareWarning, ShoppingCart } from 'lucide-react';
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
  const lowInventoryThreshold = dashboard?.lowInventoryThreshold ?? 0;
  const availableRecentOrders = recentOrders.filter(order => order.orderDomain.toLowerCase() === 'available');
  const customRecentOrders = recentOrders.filter(order => order.orderDomain.toLowerCase() === 'custom');

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Tổng quan công việc</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard title="Đơn thường mới hôm nay" value={availableRecentOrders.length} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatisticCard title="Đơn thường chờ xác nhận" value={dashboard?.pendingAvailableOrders ?? 0} icon={<ClipboardList className="h-5 w-5" />} />
        <StatisticCard title="Đơn custom chờ đánh giá hoa" value={dashboard?.pendingCustomOrders ?? 0} icon={<Flower className="h-5 w-5" />} />
        <StatisticCard title="Demo chờ khách phản hồi" value={dashboard?.demosPendingApproval ?? 0} icon={<MessageSquareWarning className="h-5 w-5" />} />
      </div>

      {lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo sắp hết hàng
            </CardTitle>
            <p className="text-sm text-orange-700">
              Sản phẩm có tồn kho nhỏ hơn hoặc bằng {lowInventoryThreshold}.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border border-orange-200 bg-white px-4 py-2">
                  <span className="text-sm font-medium">{item.productName || item.productId}</span>
                  <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    Còn {item.quantityOnHand}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng thường mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableRecentOrders.slice(0, 5).map(order => (
                <div key={order.orderId} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{order.orderCode}</p>
                    <p className="text-xs text-muted-foreground">{order.orderedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="availableOrder" status={order.orderStatus.toLowerCase()} />
                    <span className="text-sm font-medium">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              ))}
              {availableRecentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">Hôm nay chưa có đơn thường mới.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn custom mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customRecentOrders.slice(0, 5).map(order => (
                <div key={order.orderId} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{order.orderCode}</p>
                    <p className="text-xs text-muted-foreground">{order.orderedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="customOrder" status={order.orderStatus.toLowerCase()} />
                    <span className="text-sm font-medium">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              ))}
              {customRecentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">Hôm nay chưa có đơn custom mới.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
