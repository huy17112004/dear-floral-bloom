import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Trash2, PackagePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { purchaseReceiptApi, productApi } from '@/api';
import type { PurchaseReceiptResponse, CreatePurchaseReceiptRequest } from '@/api/purchaseReceiptApi';
import type { ProductResponse } from '@/api/productApi';
import { toast } from 'sonner';

// ---------- types ----------
interface LineItem {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
}

// ---------- ProductCombobox ----------
function ProductCombobox({
  products,
  value,
  onChange,
}: {
  products: ProductResponse[];
  value: number | null;
  onChange: (p: ProductResponse) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = products.find(p => p.productId === value);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected ? selected.name : 'Chọn sản phẩm…'}
        </span>
        <span className="ml-2 text-muted-foreground">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover shadow-lg">
          <div className="sticky top-0 border-b bg-popover px-2 py-2">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="h-8 text-sm"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Không tìm thấy</p>
          ) : (
            filtered.map(p => (
              <button
                key={p.productId}
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onChange(p);
                  setSearch('');
                  setOpen(false);
                }}
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {p.productKind === 'STANDARD_PRODUCT' || p.productKind === 'standard_product'
                    ? 'SP'
                    : 'Khung'}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------- CreateReceiptDialog ----------
function CreateReceiptDialog({
  products,
  onCreated,
}: {
  products: ProductResponse[];
  onCreated: (r: PurchaseReceiptResponse) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [receiptDate, setReceiptDate] = useState(today);
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineItem[]>([
    { productId: 0, productName: '', quantity: 1, unitCost: 0 },
  ]);

  function resetForm() {
    setReceiptDate(today);
    setNote('');
    setLines([{ productId: 0, productName: '', quantity: 1, unitCost: 0 }]);
  }

  function addLine() {
    setLines(prev => [...prev, { productId: 0, productName: '', quantity: 1, unitCost: 0 }]);
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<LineItem>) {
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  async function handleSubmit() {
    // validation
    if (!receiptDate) {
      toast.error('Vui lòng chọn ngày nhập');
      return;
    }
    if (lines.some(l => !l.productId)) {
      toast.error('Vui lòng chọn sản phẩm cho tất cả dòng');
      return;
    }
    if (lines.some(l => l.quantity < 1)) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }
    if (lines.some(l => l.unitCost <= 0)) {
      toast.error('Đơn giá phải lớn hơn 0');
      return;
    }
    // check duplicate products
    const ids = lines.map(l => l.productId);
    if (new Set(ids).size !== ids.length) {
      toast.error('Có sản phẩm bị trùng, vui lòng gộp lại');
      return;
    }

    const payload: CreatePurchaseReceiptRequest = {
      receiptDate,
      note: note.trim() || undefined,
      items: lines.map(l => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost,
      })),
    };

    try {
      setSubmitting(true);
      const response = await purchaseReceiptApi.createPurchaseReceipt(payload);
      toast.success(`Đã tạo phiếu nhập ${response.data.receiptCode}`);
      onCreated(response.data);
      setOpen(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo phiếu nhập thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) resetForm();
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> Tạo phiếu nhập
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <PackagePlus className="h-5 w-5" /> Tạo phiếu nhập hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="receipt-date">Ngày nhập *</Label>
              <Input
                id="receipt-date"
                type="date"
                value={receiptDate}
                onChange={e => setReceiptDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receipt-note">Ghi chú</Label>
              <Textarea
                id="receipt-note"
                rows={1}
                placeholder="Ghi chú (tùy chọn)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <Label>Danh sách mặt hàng *</Label>

            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_90px_120px_auto] items-center gap-2 rounded-lg border bg-muted/30 p-2"
                >
                  {/* Product combobox */}
                  <ProductCombobox
                    products={products}
                    value={line.productId || null}
                    onChange={p =>
                      updateLine(idx, { productId: p.productId, productName: p.name })
                    }
                  />

                  {/* Quantity */}
                  <Input
                    type="number"
                    min={1}
                    placeholder="SL"
                    value={line.quantity}
                    onChange={e =>
                      updateLine(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="text-center"
                  />

                  {/* Unit cost */}
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Đơn giá"
                    value={line.unitCost === 0 ? '' : line.unitCost}
                    onChange={e =>
                      updateLine(idx, { unitCost: parseFloat(e.target.value) || 0 })
                    }
                  />

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(idx)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={addLine}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm dòng
            </Button>
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="flex justify-end rounded-lg bg-muted/50 px-4 py-2 text-sm font-medium">
              <span className="text-muted-foreground mr-2">Tổng giá trị nhập:</span>
              <span>{total.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo phiếu nhập'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main page ----------
export default function AdminPurchaseReceipts() {
  const [receipts, setReceipts] = useState<PurchaseReceiptResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [receiptRes, productRes] = await Promise.all([
          purchaseReceiptApi.getPurchaseReceipts({ page: 0, limit: 100 }),
          productApi.getAdminProducts({ page: 0, limit: 500 }),
        ]);
        setReceipts(receiptRes.data);
        setProducts(productRes.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
        toast.error(message);
      }
    };

    void load();
  }, []);

  function handleCreated(receipt: PurchaseReceiptResponse) {
    setReceipts(prev => [receipt, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Phiếu nhập hàng</h1>
        <CreateReceiptDialog products={products} onCreated={handleCreated} />
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
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-heading">{r.receiptCode}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-caption">
                            Ngày: {new Date(r.receiptDate).toLocaleDateString('vi-VN')}
                          </p>
                          {r.items?.map(item => (
                            <div
                              key={`${item.productId}-${item.productName}`}
                              className="flex justify-between rounded-lg bg-surface-warm p-3 text-sm"
                            >
                              <div>
                                <span className="font-medium">{item.productName}</span>
                                <span className="ml-2 text-caption">x{item.quantity}</span>
                              </div>
                              <span>{item.subtotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t pt-3 text-sm font-medium">
                            <span>Tổng</span>
                            <span>
                              {r.items?.reduce((s, i) => s + i.subtotal, 0).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}

              {receipts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Chưa có phiếu nhập nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
