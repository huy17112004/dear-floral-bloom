import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inventoryApi } from '@/api';
import type { InventoryItemResponse } from '@/api/inventoryApi';
import { toast } from 'sonner';

export default function StaffInventory() {
  const [items, setItems] = useState<InventoryItemResponse[]>([]);
  const [kindFilter, setKindFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await inventoryApi.getInventory({ page: 0, limit: 200 });
        setItems(response.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải tồn kho';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const filtered = kindFilter === 'all'
    ? items
    : items.filter(item => item.productKind.toLowerCase() === kindFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Theo dõi tồn kho</h1>
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
                <TableHead>Mặt hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.productKind.toLowerCase() === 'frame_option' ? 'Khung tranh' : 'Sản phẩm'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{item.quantityOnHand}</TableCell>
                  <TableCell>
                    {item.quantityOnHand <= 5 ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Thấp</Badge>
                    ) : item.quantityOnHand <= 15 ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Trung bình</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Đủ</Badge>
                    )}
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

