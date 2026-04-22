import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productApi, categoryApi } from '@/api';
import { mapCategory, mapProduct } from '@/api/mappers';
import type { Product } from '@/types';
import { toast } from 'sonner';

export default function StaffProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [kindFilter, setKindFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productApi.getAdminProducts({ page: 0, limit: 200 }),
          categoryApi.getAdminCategories(),
        ]);

        const categories = categoriesResponse.data.map(mapCategory);
        const categoryMap = new Map(categories.map(c => [c.id, c]));
        const mappedProducts = productsResponse.data.map(mapProduct).map(product => ({
          ...product,
          category: categoryMap.get(product.categoryId),
        }));

        setProducts(mappedProducts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách sản phẩm';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const filtered = kindFilter === 'all'
    ? products
    : products.filter(product => product.productKind === kindFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý mặt hàng</h1>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.productKind === 'frame_option' ? 'Khung tranh' : 'Sản phẩm'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>{product.category?.name || '—'}</TableCell>
                  <TableCell>{product.isSellableDirectly ? '✓' : '—'}</TableCell>
                  <TableCell>{product.isCustomSelectable ? '✓' : '—'}</TableCell>
                  <TableCell>{product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

