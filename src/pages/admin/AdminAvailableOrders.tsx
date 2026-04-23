import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { availableOrderApi } from '@/api';
import { mapAvailableOrder } from '@/api/mappers';
import type { AvailableOrder, AvailableOrderStatus } from '@/types';
import { toast } from 'sonner';

const nextStatusOptions: AvailableOrderStatus[] = ['processing', 'shipping', 'completed', 'canceled'];

export default function AdminAvailableOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AvailableOrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdateMap, setStatusUpdateMap] = useState<Record<string, AvailableOrderStatus>>({});

  const loadOrders = async () => {
    try {
      const response = await availableOrderApi.getAdminAvailableOrders({
        page: 0,
        limit: 100,
        keyword: search || undefined,
        orderStatus: statusFilter === 'all' ? undefined : statusFilter,
      });
      const mapped = response.data.map(mapAvailableOrder);
      setOrders(mapped);
      setStatusUpdateMap(
        mapped.reduce<Record<string, AvailableOrderStatus>>((acc, order) => {
          acc[order.id] = order.orderStatus;
          return acc;
        }, {})
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn thường';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(
    () => orders.filter(o => !search || o.orderCode.toLowerCase().includes(search.toLowerCase())),
    [orders, search]
  );

  const handleUpdateStatus = async (orderId: string) => {
    const targetStatus = statusUpdateMap[orderId];
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder || !targetStatus || targetOrder.orderStatus === targetStatus) {
      return;
    }

    try {
      await availableOrderApi.updateAdminAvailableOrderStatus(Number(orderId), { status: targetStatus });
      toast.success('Cập nhật trạng thái đơn thành công');
      await loadOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật trạng thái thất bại';
      toast.error(message);
      setStatusUpdateMap(prev => ({ ...prev, [orderId]: targetOrder.orderStatus }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Đơn hàng thường</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caption" />
              <Input placeholder="Tìm mã đơn..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as AvailableOrderStatus | 'all')}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
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
        </CardHeader>
        <CardContent>
          {loading && <p className="mb-4 text-sm text-caption">Đang tải dữ liệu...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-heading">{o.orderCode}</TableCell>
                  <TableCell className="text-body">{new Date(o.orderedAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="font-medium">{o.totalAmount.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell><StatusBadge type="payment" status={o.paymentStatus} /></TableCell>
                  <TableCell><StatusBadge type="availableOrder" status={o.orderStatus} /></TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-heading">{o.orderCode}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <StatusBadge type="availableOrder" status={o.orderStatus} />
                            <StatusBadge type="payment" status={o.paymentStatus} />
                          </div>
                          <div className="space-y-2">
                            {o.items?.map(item => (
                              <div key={item.id} className="flex justify-between rounded-lg bg-surface-warm p-3 text-sm">
                                <span>{item.product?.name || item.productId} x{item.quantity}</span>
                                <span className="font-medium">{item.subtotal.toLocaleString('vi-VN')}₫</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between border-t pt-3 font-medium">
                            <span>Tổng</span>
                            <span>{o.totalAmount.toLocaleString('vi-VN')}₫</span>
                          </div>
                          <Select
                            value={statusUpdateMap[o.id] || o.orderStatus}
                            onValueChange={value => setStatusUpdateMap(prev => ({ ...prev, [o.id]: value as AvailableOrderStatus }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Cập nhật trạng thái" /></SelectTrigger>
                            <SelectContent>
                              {nextStatusOptions.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button className="w-full rounded-full" onClick={() => void handleUpdateStatus(o.id)}>Cập nhật</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
