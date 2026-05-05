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
        const message = error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i Ä‘Æ¡n custom';
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
        <h1 className="font-heading text-2xl font-bold text-heading">Quáº£n lÃ½ Ä‘Æ¡n hÃ ng custom</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Lá»c tráº¡ng thÃ¡i" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Táº¥t cáº£</SelectItem>
            <SelectItem value="deposited">ÄÃ£ Ä‘áº·t cá»c</SelectItem>
            <SelectItem value="waiting_flower_review">Chá» Ä‘Ã¡nh giÃ¡ hoa</SelectItem>`r`n            <SelectItem value="waiting_flower_receipt">Chờ nhận hoa từ khách</SelectItem>
            <SelectItem value="in_progress">Äang thá»±c hiá»‡n</SelectItem>
            <SelectItem value="waiting_demo_feedback">Chá» duyá»‡t demo</SelectItem>
            <SelectItem value="waiting_remaining_payment">Chá» thanh toÃ¡n</SelectItem>
            <SelectItem value="completed">HoÃ n thÃ nh</SelectItem>
            <SelectItem value="canceled">ÄÃ£ há»§y</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MÃ£ Ä‘Æ¡n</TableHead>
                <TableHead>Loáº¡i hoa</TableHead>
                <TableHead>Khung tranh</TableHead>
                <TableHead>Tráº¡ng thÃ¡i</TableHead>
                <TableHead>ÄÃ¡nh giÃ¡ hoa</TableHead>
                <TableHead>Tá»•ng tiá»n</TableHead>
                <TableHead className="text-right">Thao tÃ¡c</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderCode}</TableCell>
                  <TableCell>{order.flowerType}</TableCell>
                  <TableCell>{order.selectedFrame?.name || 'â€”'}</TableCell>
                  <TableCell><StatusBadge type="customOrder" status={order.orderStatus} /></TableCell>
                  <TableCell><StatusBadge type="flowerEval" status={order.flowerEvaluationStatus} /></TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('vi-VN')}Ä‘</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="mr-1 h-4 w-4" /> Chi tiáº¿t
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
            <DialogTitle>Chi tiáº¿t Ä‘Æ¡n {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Loáº¡i hoa:</span> {selectedOrder.flowerType}</div>
              <div><span className="text-muted-foreground">Khung:</span> {selectedOrder.selectedFrame?.name || 'â€”'}</div>
              <div><span className="text-muted-foreground">Äáº·t cá»c:</span> {selectedOrder.depositAmount.toLocaleString('vi-VN')}Ä‘</div>
              <div><span className="text-muted-foreground">CÃ²n láº¡i:</span> {selectedOrder.remainingAmount.toLocaleString('vi-VN')}Ä‘</div>
              <div className="col-span-2"><span className="text-muted-foreground">YÃªu cáº§u:</span> {selectedOrder.personalizationContent || 'â€”'}</div>
              <div><span className="text-muted-foreground">Tráº¡ng thÃ¡i:</span> <StatusBadge type="customOrder" status={selectedOrder.orderStatus} /></div>
              <div><span className="text-muted-foreground">Thanh toÃ¡n:</span> <StatusBadge type="payment" status={selectedOrder.paymentStatus} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


