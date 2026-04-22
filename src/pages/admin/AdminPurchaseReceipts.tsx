import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { purchaseReceiptApi } from '@/api';
import type { PurchaseReceiptResponse } from '@/api/purchaseReceiptApi';
import { toast } from 'sonner';

export default function AdminPurchaseReceipts() {
  const [receipts, setReceipts] = useState<PurchaseReceiptResponse[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await purchaseReceiptApi.getPurchaseReceipts({ page: 0, limit: 100 });
        setReceipts(response.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải phiếu nhập';
        toast.error(message);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Phiếu nhập hàng</h1>
        <Button className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Tạo phiếu nhập</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Số mặt hàng</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map(r => (
                <TableRow key={r.purchaseReceiptId}>
                  <TableCell className="font-medium text-heading">{r.receiptCode}</TableCell>
                  <TableCell>{new Date(r.receiptDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{r.items?.length || 0}</TableCell>
                  <TableCell className="text-body">{r.note}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-heading">{r.receiptCode}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-caption">Ngày: {new Date(r.receiptDate).toLocaleDateString('vi-VN')}</p>
                          {r.items?.map(item => {
                            return (
                              <div key={`${item.productId}-${item.productName}`} className="flex justify-between rounded-lg bg-surface-warm p-3 text-sm">
                                <div>
                                  <span className="font-medium">{item.productName}</span>
                                  <span className="ml-2 text-caption">x{item.quantity}</span>
                                </div>
                                <span>{item.subtotal.toLocaleString('vi-VN')}₫</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between border-t pt-3 font-medium text-sm">
                            <span>Tổng</span>
                            <span>{r.items?.reduce((s, i) => s + i.subtotal, 0).toLocaleString('vi-VN')}₫</span>
                          </div>
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
