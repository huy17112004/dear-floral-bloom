import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { AvailableOrder, AvailableOrderStatus, DeliveryStatus } from '@/types';
import { Eye } from 'lucide-react';
import { availableOrderApi, availableOrderDeliveryApi } from '@/api';
import { mapAvailableOrder } from '@/api/mappers';
import { toast } from 'sonner';

const deliveryStatuses: DeliveryStatus[] = ['pending', 'shipped', 'delivered', 'failed'];
const availableOrderStatuses: AvailableOrderStatus[] = ['received', 'processing', 'shipping', 'completed', 'canceled'];

function toDeliveryApiStatus(status: DeliveryStatus): string {
  return status.toUpperCase();
}

function toUiDeliveryStatus(status?: string): DeliveryStatus {
  const normalized = status?.toLowerCase();
  if (normalized === 'shipped') {
    return 'shipped';
  }
  if (normalized === 'delivered') {
    return 'delivered';
  }
  if (normalized === 'failed') {
    return 'failed';
  }
  return 'pending';
}

export default function StaffAvailableOrders() {
  const [selectedOrder, setSelectedOrder] = useState<AvailableOrder | null>(null);
  const [deliveryStatusMap, setDeliveryStatusMap] = useState<Record<string, DeliveryStatus>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await availableOrderApi.getAdminAvailableOrders({
        page: 0,
        limit: 100,
        orderStatus: statusFilter === 'all' ? undefined : (statusFilter as AvailableOrderStatus),
      });
      const mapped = response.data.map(mapAvailableOrder);
      setOrders(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng thường';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdateDelivery = async (orderId: string, status: DeliveryStatus) => {
    setDeliveryStatusMap(prev => ({ ...prev, [orderId]: status }));
    try {
      await availableOrderDeliveryApi.updateAvailableOrderDelivery(Number(orderId), {
        deliveryStatus: toDeliveryApiStatus(status),
      });
      toast.success('Cập nhật giao nhận thành công');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật giao nhận thất bại';
      toast.error(message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: AvailableOrderStatus) => {
    try {
      await availableOrderApi.updateAdminAvailableOrderStatus(Number(orderId), { status });
      toast.success('Cập nhật trạng thái đơn thành công');
      await loadOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật trạng thái đơn thất bại';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý đơn hàng thường</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="received">Đã tiếp nhận</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="shipping">Đang giao</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="canceled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && <p className="p-4 text-sm text-caption">Đang tải dữ liệu...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Giao nhận</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderCode}</TableCell>
                  <TableCell>{new Date(order.orderedAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell><StatusBadge type="availableOrder" status={order.orderStatus} /></TableCell>
                  <TableCell><StatusBadge type="delivery" status={deliveryStatusMap[order.id] || 'pending'} /></TableCell>
                  <TableCell><StatusBadge type="payment" status={order.paymentStatus} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="mr-1 h-4 w-4" /> Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge type="availableOrder" status={selectedOrder.orderStatus} /></div>
                <div><span className="text-muted-foreground">Thanh toán:</span> <StatusBadge type="payment" status={selectedOrder.paymentStatus} /></div>
                <div><span className="text-muted-foreground">Ngày đặt:</span> {new Date(selectedOrder.orderedAt).toLocaleDateString('vi-VN')}</div>
                <div><span className="text-muted-foreground">Tổng tiền:</span> <span className="font-semibold">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span></div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-sm">{item.product?.name || item.productId} × {item.quantity}</span>
                      <span className="text-sm font-medium">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">Cập nhật giao nhận</p>
                <Select
                  value={deliveryStatusMap[selectedOrder.id] || 'pending'}
                  onValueChange={(v) => void handleUpdateDelivery(selectedOrder.id, v as DeliveryStatus)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryStatuses.map(s => (
                      <SelectItem key={s} value={s}>
                        {s === 'pending' ? 'Chờ giao' : s === 'shipped' ? 'Đang giao' : s === 'delivered' ? 'Đã giao' : 'Thất bại'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">Cập nhật trạng thái đơn</p>
                <div className="flex flex-wrap gap-2">
                  {availableOrderStatuses.map(s => (
                    <Button
                      key={s}
                      variant={selectedOrder.orderStatus === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => void handleUpdateOrderStatus(selectedOrder.id, s)}
                    >
                      <StatusBadge type="availableOrder" status={s} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
