import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockProducts, mockCategories } from '@/data/mockData';
import type { Product, ProductKind } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function StaffProductList() {
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filtered = kindFilter === 'all'
    ? mockProducts
    : mockProducts.filter(p => p.productKind === kindFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý mặt hàng</h1>
        <div className="flex items-center gap-3">
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại mặt hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="standard_product">Sản phẩm thường</SelectItem>
              <SelectItem value="frame_option">Khung tranh</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm mặt hàng
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên mặt hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Bán trực tiếp</TableHead>
                <TableHead>Custom</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => {
                const category = mockCategories.find(c => c.id === product.categoryId);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={product.productKind === 'frame_option' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                        {product.productKind === 'frame_option' ? 'Khung tranh' : 'Sản phẩm'}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{category?.name || '—'}</TableCell>
                    <TableCell>{product.isSellableDirectly ? '✓' : '—'}</TableCell>
                    <TableCell>{product.isCustomSelectable ? '✓' : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={product.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                        {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditProduct(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={showCreateDialog || !!editProduct} onOpenChange={() => { setShowCreateDialog(false); setEditProduct(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Chỉnh sửa mặt hàng' : 'Thêm mặt hàng mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên mặt hàng</Label>
              <Input defaultValue={editProduct?.name || ''} placeholder="Nhập tên sản phẩm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại mặt hàng</Label>
                <Select defaultValue={editProduct?.productKind || 'standard_product'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard_product">Sản phẩm thường</SelectItem>
                    <SelectItem value="frame_option">Khung tranh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Danh mục</Label>
                <Select defaultValue={editProduct?.categoryId || ''}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Giá (VNĐ)</Label>
              <Input type="number" defaultValue={editProduct?.price || ''} placeholder="0" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea defaultValue={editProduct?.description || ''} placeholder="Mô tả sản phẩm..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Kích thước</Label>
                <Input defaultValue={editProduct?.size || ''} placeholder="20x30cm" />
              </div>
              <div>
                <Label>Chất liệu</Label>
                <Input defaultValue={editProduct?.material || ''} placeholder="Gỗ sồi" />
              </div>
              <div>
                <Label>Loại hoa</Label>
                <Input defaultValue={editProduct?.flowerType || ''} placeholder="Hoa hồng" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch defaultChecked={editProduct?.isSellableDirectly ?? true} />
                <Label>Bán trực tiếp</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked={editProduct?.isCustomSelectable ?? false} />
                <Label>Cho phép custom</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditProduct(null); }}>Hủy</Button>
            <Button>{editProduct ? 'Lưu thay đổi' : 'Tạo mặt hàng'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
