import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { purchaseReceiptApi, productApi } from '@/api';
import type { ProductResponse } from '@/api/productApi';
import type { PurchaseReceiptResponse } from '@/api/purchaseReceiptApi';
import { Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffPurchaseReceipts() {
  const [receipts, setReceipts] = useState<PurchaseReceiptResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceiptResponse | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [receiptDate, setReceiptDate] = useState('');
  const [note, setNote] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const loadData = async () => {
    try {
      const [receiptsResponse, productsResponse] = await Promise.all([
        purchaseReceiptApi.getPurchaseReceipts({ page: 0, limit: 100 }),
        productApi.getAdminProducts({ page: 0, limit: 200 }),
      ]);
      setReceipts(receiptsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu phiếu nhập';
      toast.error(message);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onCreateReceipt = async () => {
    if (!receiptDate || !productId || quantity <= 0 || unitCost <= 0) {
      toast.error('Vui lòng nhập đủ thông tin phiếu nhập');
      return;
    }

    try {
      await purchaseReceiptApi.createPurchaseReceipt({
        receiptDate,
        note,
        items: [{ productId: Number(productId), quantity, unitCost }],
      });
      toast.success('Tạo phiếu nhập thành công');
      setShowCreate(false);
      setReceiptDate('');
      setNote('');
      setProductId('');
      setQuantity(1);
      setUnitCost(0);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo phiếu nhập';
      toast.error(message);
    }
  };

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
              {receipts.map(receipt => {
                const totalValue = receipt.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
                return (
                  <TableRow key={receipt.purchaseReceiptId}>
                    <TableCell className="font-medium">{receipt.receiptCode}</TableCell>
                    <TableCell>{receipt.receiptDate}</TableCell>
                    <TableCell>{receipt.items?.length || 0}</TableCell>
                    <TableCell>{totalValue.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">{receipt.note || '—'}</TableCell>
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
                {selectedReceipt.items?.map(item => (
                  <div key={`${item.productId}-${item.productName}`} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">SL: {item.quantity} × {item.unitCost.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <span className="text-sm font-semibold">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo phiếu nhập mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ngày nhập</Label>
              <Input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea placeholder="Ghi chú phiếu nhập..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="rounded-lg border p-3 space-y-3">
              <p className="text-sm font-semibold">Mặt hàng nhập</p>
              <div>
                <Label>Sản phẩm</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue placeholder="Chọn sản phẩm" /></SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.productId} value={String(product.productId)}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Số lượng</Label>
                  <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Đơn giá nhập</Label>
                  <Input type="number" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={() => void onCreateReceipt()}>Tạo phiếu nhập</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

