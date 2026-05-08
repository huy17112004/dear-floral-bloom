import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reportApi, purchaseReceiptApi } from '@/api';
import type { InventoryReportItem, OrderStatisticItem, RevenueReportItemResponse } from '@/api/reportApi';
import type { PurchaseReceiptResponse } from '@/api/purchaseReceiptApi';
import { toast } from 'sonner';

const MONEY = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} ₫`;

export default function AdminReports() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [revenueItems, setRevenueItems] = useState<RevenueReportItemResponse[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStatisticItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryReportItem[]>([]);
  const [receipts, setReceipts] = useState<PurchaseReceiptResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const query = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [fromDate, toDate]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [revenueRes, ordersRes, inventoryRes, receiptsRes] = await Promise.all([
        reportApi.getRevenueReport({ ...query, groupBy: 'MONTH' }),
        reportApi.getOrderReport({ ...query, orderDomain: 'ALL' }),
        reportApi.getInventoryReport(),
        purchaseReceiptApi.getPurchaseReceipts(query),
      ]);
      setRevenueItems(Array.isArray(revenueRes.data) ? revenueRes.data : []);
      setOrderStats(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setInventoryItems(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      setReceipts(Array.isArray(receiptsRes.data) ? receiptsRes.data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totalRevenue = useMemo(
    () => revenueItems.reduce((sum, item) => sum + Number(item.totalRevenue ?? 0), 0),
    [revenueItems]
  );
  const availableRevenue = useMemo(
    () => revenueItems.reduce((sum, item) => sum + Number(item.availableRevenue ?? 0), 0),
    [revenueItems]
  );
  const customRevenue = useMemo(
    () => revenueItems.reduce((sum, item) => sum + Number(item.customRevenue ?? 0), 0),
    [revenueItems]
  );
  const inventoryTotalQty = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + Number(item.quantityOnHand ?? 0), 0),
    [inventoryItems]
  );
  const lowStockItems = useMemo(
    () => [...inventoryItems].filter(i => Number(i.quantityOnHand ?? 0) <= 5).sort((a, b) => a.quantityOnHand - b.quantityOnHand),
    [inventoryItems]
  );
  const importCost = useMemo(
    () => receipts.reduce((sum, receipt) => sum + receipt.items.reduce((sub, item) => sub + Number(item.subtotal ?? 0), 0), 0),
    [receipts]
  );
  const grossProfit = totalRevenue - importCost;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const orderSummary = useMemo(() => {
    const map = new Map<string, number>();
    orderStats.forEach(item => {
      map.set(item.orderStatus, (map.get(item.orderStatus) ?? 0) + Number(item.totalOrders ?? 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orderStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-heading">Báo cáo thống kê</h1>
          <p className="text-sm text-caption">Theo dõi tồn kho, doanh thu, lợi nhuận và đơn hàng.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <p className="text-xs text-caption mb-1">Từ ngày</p>
            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-caption mb-1">Đến ngày</p>
            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <Button onClick={() => void loadData()} disabled={loading}>{loading ? 'Đang tải...' : 'Lọc báo cáo'}</Button>
        </div>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="profit">Lợi nhuận</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Tổng SKU</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{inventoryItems.length}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Tổng tồn kho</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{inventoryTotalQty}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">SKU tồn thấp (≤5)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{lowStockItems.length}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Danh sách tồn kho thấp</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.length === 0 && <p className="text-sm text-caption">Không có sản phẩm tồn kho thấp.</p>}
              {lowStockItems.slice(0, 15).map(item => (
                <div key={item.productId} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span>{item.productName}</span>
                  <span className="font-medium">{item.quantityOnHand}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Doanh thu tổng</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{MONEY(totalRevenue)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Doanh thu đơn thường</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{MONEY(availableRevenue)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Doanh thu đơn custom</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{MONEY(customRevenue)}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Doanh thu theo kỳ</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {revenueItems.length === 0 && <p className="text-sm text-caption">Không có dữ liệu doanh thu.</p>}
              {revenueItems.map(item => (
                <div key={item.bucketDate} className="grid grid-cols-4 items-center rounded border p-2 text-sm">
                  <span>{item.bucketDate}</span>
                  <span>{MONEY(Number(item.availableRevenue ?? 0))}</span>
                  <span>{MONEY(Number(item.customRevenue ?? 0))}</span>
                  <span className="font-semibold">{MONEY(Number(item.totalRevenue ?? 0))}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Giá vốn nhập hàng</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{MONEY(importCost)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Lợi nhuận gộp</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{MONEY(grossProfit)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Biên lợi nhuận gộp</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{grossMargin.toFixed(1)}%</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Ghi chú tính lợi nhuận</CardTitle></CardHeader>
            <CardContent className="text-sm text-caption space-y-1">
              <p>- Lợi nhuận gộp = Doanh thu đã ghi nhận - Tổng giá vốn từ phiếu nhập trong kỳ lọc.</p>
              <p>- Chưa bao gồm chi phí vận hành khác (nhân công, điện nước, marketing...).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Tổng bản ghi trạng thái</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{orderStats.length}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Tổng số đơn theo thống kê</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{orderSummary.reduce((s, [, v]) => s + v, 0)}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Phân bổ trạng thái đơn hàng</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {orderSummary.length === 0 && <p className="text-sm text-caption">Không có dữ liệu đơn hàng.</p>}
              {orderSummary.map(([status, total]) => (
                <div key={status} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span>{status}</span>
                  <span className="font-semibold">{total}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
