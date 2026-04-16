import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockAvailableOrders, mockCustomOrders, mockAddresses } from '@/data/mockData';
import type { DeliveryStatus } from '@/types';

interface DeliveryRow {
  id: string;
  orderCode: string;
  type: 'available' | 'custom';
  customerAddress: string;
  deliveryStatus: DeliveryStatus;
  orderedAt: string;
}

const mockDeliveryRows: DeliveryRow[] = [
  ...mockAvailableOrders.map(o => {
    const addr = mockAddresses.find(a => a.id === o.shippingAddressId);
    return {
      id: o.id,
      orderCode: o.orderCode,
      type: 'available' as const,
      customerAddress: addr ? `${addr.addressLine}, ${addr.district}` : '—',
      deliveryStatus: (o.orderStatus === 'completed' ? 'delivered' : o.orderStatus === 'shipping' ? 'shipped' : 'pending') as DeliveryStatus,
      orderedAt: o.orderedAt,
    };
  }),
  ...mockCustomOrders.map(o => {
    const addr = mockAddresses.find(a => a.id === o.shippingAddressId);
    return {
      id: o.id,
      orderCode: o.orderCode,
      type: 'custom' as const,
      customerAddress: addr ? `${addr.addressLine}, ${addr.district}` : '—',
      deliveryStatus: (o.orderStatus === 'completed' ? 'delivered' : 'pending') as DeliveryStatus,
      orderedAt: o.orderedAt,
    };
  }),
];

export default function StaffDeliveryTracking() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? mockDeliveryRows
    : mockDeliveryRows.filter(r => r.deliveryStatus === filter);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Loại đơn</TableHead>
                <TableHead>Địa chỉ giao</TableHead>
                <TableHead>Trạng thái giao</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Cập nhật</TableHead>
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
                  <TableCell className="max-w-[200px] truncate">{row.customerAddress}</TableCell>
                  <TableCell><StatusBadge type="delivery" status={row.deliveryStatus} /></TableCell>
                  <TableCell>{row.orderedAt}</TableCell>
                  <TableCell className="text-right">
                    <Select defaultValue={row.deliveryStatus}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ giao</SelectItem>
                        <SelectItem value="shipped">Đang giao</SelectItem>
                        <SelectItem value="delivered">Đã giao</SelectItem>
                        <SelectItem value="failed">Thất bại</SelectItem>
                      </SelectContent>
                    </Select>
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
