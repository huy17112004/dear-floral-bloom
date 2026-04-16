import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockAvailableOrders, mockProducts, mockAddresses } from '@/data/mockData';
import type { AvailableOrder, AvailableOrderStatus, DeliveryStatus } from '@/types';
import { Eye, Truck } from 'lucide-react';

const deliveryStatuses: DeliveryStatus[] = ['pending', 'shipped', 'delivered', 'failed'];

export default function StaffAvailableOrders() {
  const [selectedOrder, setSelectedOrder] = useState<AvailableOrder | null>(null);
  const [deliveryStatusMap, setDeliveryStatusMap] = useState<Record<string, DeliveryStatus>>({
    'ao-1': 'delivered',
    'ao-2': 'pending',
    'ao-3': 'shipped',
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = statusFilter === 'all'
    ? mockAvailableOrders
    : mockAvailableOrders.filter(o => o.orderStatus === statusFilter);

  const handleUpdateDelivery = (orderId: string, status: DeliveryStatus) => {
    setDeliveryStatusMap(prev => ({ ...prev, [orderId]: status }));
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
              {filtered.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderCode}</TableCell>
                  <TableCell>{order.orderedAt}</TableCell>
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

      {/* Detail dialog */}
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
                <div><span className="text-muted-foreground">Ngày đặt:</span> {selectedOrder.orderedAt}</div>
                <div><span className="text-muted-foreground">Tổng tiền:</span> <span className="font-semibold">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span></div>
              </div>

              {/* Address */}
              {(() => {
                const addr = mockAddresses.find(a => a.id === selectedOrder.shippingAddressId);
                return addr ? (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-semibold mb-1">Địa chỉ giao hàng</p>
                    <p className="text-sm">{addr.receiverName} — {addr.receiverPhone}</p>
                    <p className="text-xs text-muted-foreground">{addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}</p>
                  </div>
                ) : null;
              })()}

              {/* Items */}
              <div>
                <p className="text-sm font-semibold mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map(item => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-sm">{product?.name || item.productId} × {item.quantity}</span>
                        <span className="text-sm font-medium">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery status update */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Truck className="h-4 w-4" /> Cập nhật giao nhận</p>
                <Select
                  value={deliveryStatusMap[selectedOrder.id] || 'pending'}
                  onValueChange={(v) => handleUpdateDelivery(selectedOrder.id, v as DeliveryStatus)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryStatuses.map(s => (
                      <SelectItem key={s} value={s}>{s === 'pending' ? 'Chờ giao' : s === 'shipped' ? 'Đang giao' : s === 'delivered' ? 'Đã giao' : 'Thất bại'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order status update */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">Cập nhật trạng thái đơn</p>
                <div className="flex flex-wrap gap-2">
                  {(['received', 'processing', 'shipping', 'completed', 'canceled'] as AvailableOrderStatus[]).map(s => (
                    <Button key={s} variant={selectedOrder.orderStatus === s ? 'default' : 'outline'} size="sm">
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
