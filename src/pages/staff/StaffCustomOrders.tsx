import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Eye } from 'lucide-react';
import { adminCustomOrderApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import type { CustomOrder } from '@/types';
import { toast } from 'sonner';

export default function StaffCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminCustomOrderApi.getAdminCustomOrders({ page: 0, limit: 100 });
        setOrders(response.data.map(mapCustomOrder));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải đơn custom';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.orderStatus === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý đơn hàng custom</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="deposited">Đã đặt cọc</SelectItem>
            <SelectItem value="waiting_flower_review">Chờ đánh giá hoa</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="waiting_demo_feedback">Chờ duyệt demo</SelectItem>
            <SelectItem value="waiting_remaining_payment">Chờ thanh toán</SelectItem>
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
                <TableHead>Loại hoa</TableHead>
                <TableHead>Khung tranh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đánh giá hoa</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderCode}</TableCell>
                  <TableCell>{order.flowerType}</TableCell>
                  <TableCell>{order.selectedFrame?.name || '—'}</TableCell>
                  <TableCell><StatusBadge type="customOrder" status={order.orderStatus} /></TableCell>
                  <TableCell><StatusBadge type="flowerEval" status={order.flowerEvaluationStatus} /></TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('vi-VN')}đ</TableCell>
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
            <DialogTitle>Chi tiết đơn {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Loại hoa:</span> {selectedOrder.flowerType}</div>
              <div><span className="text-muted-foreground">Khung:</span> {selectedOrder.selectedFrame?.name || '—'}</div>
              <div><span className="text-muted-foreground">Đặt cọc:</span> {selectedOrder.depositAmount.toLocaleString('vi-VN')}đ</div>
              <div><span className="text-muted-foreground">Còn lại:</span> {selectedOrder.remainingAmount.toLocaleString('vi-VN')}đ</div>
              <div className="col-span-2"><span className="text-muted-foreground">Yêu cầu:</span> {selectedOrder.personalizationContent || '—'}</div>
              <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge type="customOrder" status={selectedOrder.orderStatus} /></div>
              <div><span className="text-muted-foreground">Thanh toán:</span> <StatusBadge type="payment" status={selectedOrder.paymentStatus} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

