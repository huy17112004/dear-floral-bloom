import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Calendar } from 'lucide-react';
import { customOrderApi, availableOrderApi } from '@/api';
import { mapCustomOrder, mapAvailableOrder } from '@/api/mappers';
import { getCustomOrderStepLabel } from '@/components/shared/CustomOrderProgress';
import type { CustomOrder, AvailableOrder, CustomOrderStatus, AvailableOrderStatus } from '@/types';
import { toast } from 'sonner';

type CustomFilterKey = 'all' | 'in_progress' | 'completed' | 'canceled';
type AvailableFilterKey = 'all' | 'in_progress' | 'completed' | 'canceled';
type SortKey = 'newest' | 'oldest' | 'value_desc' | 'value_asc';

const CUSTOM_FILTERS: { key: CustomFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in_progress', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'canceled', label: 'Đã huỷ' },
];

const AVAILABLE_FILTERS: { key: AvailableFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in_progress', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'canceled', label: 'Đã huỷ' },
];

const CUSTOM_IN_PROGRESS_STATUSES: CustomOrderStatus[] = [
  'deposited',
  'waiting_flower_review',
  'waiting_flower_receipt',
  'in_progress',
  'waiting_demo_feedback',
  'waiting_remaining_payment',
];

const AVAILABLE_IN_PROGRESS_STATUSES: AvailableOrderStatus[] = [
  'received',
  'processing',
  'shipping',
  'waiting_refund_info',
  'waiting_refund',
];

export default function MyOrdersPage() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [customFilter, setCustomFilter] = useState<CustomFilterKey>('all');
  const [availableFilter, setAvailableFilter] = useState<AvailableFilterKey>('all');
  const [customSort, setCustomSort] = useState<SortKey>('newest');
  const [availableSort, setAvailableSort] = useState<SortKey>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [customRes, availableRes] = await Promise.all([
          customOrderApi.getMyCustomOrders({ page: 0, limit: 100 }),
          availableOrderApi.getMyAvailableOrders({ page: 0, limit: 100 }),
        ]);
        setCustomOrders(customRes.data.map(mapCustomOrder));
        setAvailableOrders(availableRes.data.map(mapAvailableOrder));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const sortOrders = <T extends { orderedAt: string; totalAmount: number }>(orders: T[], sort: SortKey) => {
    return [...orders].sort((a, b) => {
      if (sort === 'newest') return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
      if (sort === 'oldest') return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
      if (sort === 'value_desc') return b.totalAmount - a.totalAmount;
      return a.totalAmount - b.totalAmount;
    });
  };

  const filteredCustom = useMemo(() => {
    const filtered = customFilter === 'all'
      ? customOrders
      : customFilter === 'in_progress'
        ? customOrders.filter(o => CUSTOM_IN_PROGRESS_STATUSES.includes(o.orderStatus))
        : customOrders.filter(o => o.orderStatus === customFilter);
    return sortOrders(filtered, customSort);
  }, [customOrders, customFilter, customSort]);

  const filteredAvailable = useMemo(() => {
    const filtered = availableFilter === 'all'
      ? availableOrders
      : availableFilter === 'in_progress'
        ? availableOrders.filter(o => AVAILABLE_IN_PROGRESS_STATUSES.includes(o.orderStatus))
        : availableOrders.filter(o => availableFilter === 'canceled'
          ? o.orderStatus === 'canceled' || o.orderStatus === 'refunded'
          : o.orderStatus === availableFilter);
    return sortOrders(filtered, availableSort);
  }, [availableOrders, availableFilter, availableSort]);

  const customCounts = useMemo(() => ({
    all: customOrders.length,
    in_progress: customOrders.filter(o => CUSTOM_IN_PROGRESS_STATUSES.includes(o.orderStatus)).length,
    completed: customOrders.filter(o => o.orderStatus === 'completed').length,
    canceled: customOrders.filter(o => o.orderStatus === 'canceled').length,
  }), [customOrders]);

  const availableCounts = useMemo(() => ({
    all: availableOrders.length,
    in_progress: availableOrders.filter(o => AVAILABLE_IN_PROGRESS_STATUSES.includes(o.orderStatus)).length,
    completed: availableOrders.filter(o => o.orderStatus === 'completed').length,
    canceled: availableOrders.filter(o => o.orderStatus === 'canceled' || o.orderStatus === 'refunded').length,
  }), [availableOrders]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-caption">Tài khoản</p>
          <h1 className="font-heading text-3xl font-bold text-heading">Đơn hàng của tôi</h1>
          <p className="mt-1 text-sm text-body">Quản lý và theo dõi tất cả đơn hàng của bạn.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-caption">Đang tải...</div>
      ) : (
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-surface-warm">
            <TabsTrigger value="available" className="data-[state=active]:bg-background">
              Đơn hàng bình thường <span className="ml-1.5 text-xs text-caption">({availableOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-background">
              Đơn custom <span className="ml-1.5 text-xs text-caption">({customOrders.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {availableOrders.length === 0 ? (
              <EmptyState
                title="Chưa có đơn hàng nào"
                description="Khám phá những sản phẩm tuyệt vời từ chúng tôi."
                action={<Button asChild className="rounded-full"><Link to="/products">Xem sản phẩm</Link></Button>}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Tabs value={availableFilter} onValueChange={v => setAvailableFilter(v as AvailableFilterKey)}>
                    <TabsList className="bg-surface-warm">
                      {AVAILABLE_FILTERS.map(f => (
                        <TabsTrigger key={f.key} value={f.key} className="data-[state=active]:bg-background">
                          {f.label} <span className="ml-1.5 text-xs text-caption">({availableCounts[f.key]})</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <select value={availableSort} onChange={e => setAvailableSort(e.target.value as SortKey)} className="h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="value_desc">Giá trị giảm dần</option>
                    <option value="value_asc">Giá trị tăng dần</option>
                  </select>
                </div>

                {filteredAvailable.map(order => {
                  const totalStep = 4;
                  const step = order.orderStatus === 'received' ? 1
                    : order.orderStatus === 'processing' ? 2
                    : order.orderStatus === 'shipping' ? 3
                    : order.orderStatus === 'completed' ? 4
                    : 0;
                  const progress = (step / totalStep) * 100;
                  const showProgress = !['canceled', 'refunded', 'waiting_refund_info', 'waiting_refund'].includes(order.orderStatus);
                  return (
                    <Link key={order.id} to={`/account/orders/${order.id}`} className="block group">
                      <Card className="overflow-hidden border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-5">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-heading font-semibold text-heading">{order.orderCode}</span>
                                <StatusBadge type="availableOrder" status={order.orderStatus} />
                              </div>
                              <p className="mt-1 text-sm text-caption">
                                {new Date(order.orderedAt).toLocaleDateString('vi-VN')} · {order.totalAmount.toLocaleString('vi-VN')}₫
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-caption transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                          </div>
                          {showProgress && (
                            <div className="border-t bg-surface-warm/50 px-5 py-3">
                              <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="text-caption">Bước <strong className="text-heading">{step}/{totalStep}</strong></span>
                                <span className="text-caption">{Math.round(progress)}%</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            {customOrders.length === 0 ? (
              <EmptyState
                title="Chưa có đơn custom nào"
                description="Bắt đầu hành trình lưu giữ vẻ đẹp của bạn ngay hôm nay."
                action={<Button asChild className="rounded-full"><Link to="/account/custom-orders/create">Tạo đơn custom</Link></Button>}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Tabs value={customFilter} onValueChange={v => setCustomFilter(v as CustomFilterKey)}>
                    <TabsList className="bg-surface-warm">
                      {CUSTOM_FILTERS.map(f => (
                        <TabsTrigger key={f.key} value={f.key} className="data-[state=active]:bg-background">
                          {f.label} <span className="ml-1.5 text-xs text-caption">({customCounts[f.key]})</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <select value={customSort} onChange={e => setCustomSort(e.target.value as SortKey)} className="h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="value_desc">Giá trị giảm dần</option>
                    <option value="value_asc">Giá trị tăng dần</option>
                  </select>
                </div>

                {filteredCustom.length === 0 ? (
                  <EmptyState title="Không có đơn nào" description="Không tìm thấy đơn custom theo điều kiện lọc." />
                ) : (
                  <div className="space-y-4">
                    {filteredCustom.map(order => {
                      const step = getCustomOrderStepLabel(order.orderStatus);
                      const progress = order.orderStatus === 'canceled' ? 0 : (step.current / step.total) * 100;
                      return (
                        <Link key={order.id} to={`/account/custom-orders/${order.id}`} className="block group">
                          <Card className="overflow-hidden border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md">
                            <CardContent className="p-0">
                              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-heading text-base font-semibold text-heading">{order.orderCode}</span>
                                    <StatusBadge type="customOrder" status={order.orderStatus} />
                                  </div>
                                  <p className="mt-1.5 text-sm text-body line-clamp-1">{order.flowerType} · {order.personalizationContent}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-caption">
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(order.orderedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span>Tổng: <strong className="text-heading font-medium">{order.totalAmount.toLocaleString('vi-VN')}₫</strong></span>
                                  </div>
                                </div>
                                <ArrowRight className="hidden h-5 w-5 text-caption transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
                              </div>
                              {order.orderStatus !== 'canceled' && (
                                <div className="border-t bg-surface-warm/50 px-5 py-3">
                                  <div className="mb-1.5 flex items-center justify-between text-xs">
                                    <span className="text-caption">Bước <strong className="text-heading">{step.current}/{step.total}</strong> · {step.label}</span>
                                    <span className="text-caption">{Math.round(progress)}%</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

