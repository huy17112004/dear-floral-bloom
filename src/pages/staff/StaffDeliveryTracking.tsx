import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { DeliveryStatus } from '@/types';
import { deliveryTrackingApi } from '@/api';
import { toast } from 'sonner';

interface DeliveryRow {
  id: string;
  orderCode: string;
  type: 'available' | 'custom';
  customerAddress: string;
  deliveryStatus: DeliveryStatus;
  orderedAt: string;
}

function mapStatus(status: string): DeliveryStatus {
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

export default function StaffDeliveryTracking() {
  const [filter, setFilter] = useState<string>('all');
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await deliveryTrackingApi.getDeliveryTrackingRecords({ page: 0, limit: 200 });
        setRows(
          response.data.map(item => ({
            id: `${item.trackingType}-${item.trackingRecordId}`,
            orderCode: item.orderCode,
            type: item.trackingType === 'CUSTOM_ORDER' ? 'custom' : 'available',
            customerAddress: item.customerAddress || '—',
            deliveryStatus: mapStatus(item.deliveryStatus),
            orderedAt: item.orderedAt ? new Date(item.orderedAt).toLocaleDateString('vi-VN') : '—',
          }))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu giao nhận';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter(r => r.deliveryStatus === filter)),
    [rows, filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Theo dõi giao nhận</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ giao</SelectItem>
            <SelectItem value="shipped">Đang giao</SelectItem>
            <SelectItem value="delivered">Đã giao</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
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
                <TableHead>Loại đơn</TableHead>
                <TableHead>Địa chỉ giao</TableHead>
                <TableHead>Trạng thái giao</TableHead>
                <TableHead>Ngày đặt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.orderCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={row.type === 'custom' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                      {row.type === 'custom' ? 'Custom' : 'Thường'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{row.customerAddress}</TableCell>
                  <TableCell><StatusBadge type="delivery" status={row.deliveryStatus} /></TableCell>
                  <TableCell>{row.orderedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
