import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPurchaseReceipts, mockProducts } from '@/data/mockData';
import type { PurchaseReceipt } from '@/types';
import { Plus, Eye, Trash2 } from 'lucide-react';

export default function StaffPurchaseReceipts() {
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Phiếu nhập hàng</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Tạo phiếu nhập
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Số mặt hàng</TableHead>
                <TableHead>Tổng giá trị</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchaseReceipts.map(receipt => {
                const totalValue = receipt.items?.reduce((sum, i) => sum + i.subtotal, 0) || 0;
                return (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.receiptCode}</TableCell>
                    <TableCell>{receipt.receiptDate}</TableCell>
                    <TableCell>{receipt.items?.length || 0}</TableCell>
                    <TableCell>{totalValue.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{receipt.note || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                        <Eye className="mr-1 h-4 w-4" /> Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phiếu nhập {selectedReceipt?.receiptCode}</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Ngày nhập:</span> {selectedReceipt.receiptDate}</div>
                <div><span className="text-muted-foreground">Ghi chú:</span> {selectedReceipt.note || '—'}</div>
              </div>
              <div className="space-y-2">
                {selectedReceipt.items?.map(item => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{product?.name || item.productId}</p>
                        <p className="text-xs text-muted-foreground">SL: {item.quantity} × {item.unitCost.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <span className="text-sm font-semibold">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo phiếu nhập mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ngày nhập</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea placeholder="Ghi chú phiếu nhập..." />
            </div>
            <div className="rounded-lg border p-3 space-y-3">
              <p className="text-sm font-semibold">Mặt hàng nhập</p>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label>Sản phẩm</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                    <SelectContent>
                      {mockProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label>Số lượng</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="col-span-3">
                  <Label>Giá nhập</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="col-span-1">
                  <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button>Tạo phiếu nhập</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
