import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { customOrderApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import { getCustomOrderStepLabel } from '@/components/shared/CustomOrderProgress';
import type { CustomOrder, CustomOrderStatus } from '@/types';
import { toast } from 'sonner';

type FilterKey = 'all' | 'in_progress' | 'completed' | 'canceled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in_progress', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'canceled', label: 'Đã huỷ' },
];

const IN_PROGRESS_STATUSES: CustomOrderStatus[] = [
  'deposited',
  'waiting_flower_review',
  'in_progress',
  'waiting_demo_feedback',
  'waiting_remaining_payment',
];

export default function MyCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await customOrderApi.getMyCustomOrders({ page: 0, limit: 100 });
        setOrders(response.data.map(mapCustomOrder));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn custom';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'in_progress') return orders.filter(o => IN_PROGRESS_STATUSES.includes(o.orderStatus));
    return orders.filter(o => o.orderStatus === filter);
  }, [orders, filter]);

  const counts = useMemo(() => ({
    all: orders.length,
    in_progress: orders.filter(o => IN_PROGRESS_STATUSES.includes(o.orderStatus)).length,
    completed: orders.filter(o => o.orderStatus === 'completed').length,
    canceled: orders.filter(o => o.orderStatus === 'canceled').length,
  }), [orders]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-caption">Tài khoản</p>
          <h1 className="font-heading text-3xl font-bold text-heading">Đơn hàng Custom</h1>
          <p className="mt-1 text-sm text-body">Theo dõi tiến độ những tác phẩm được chế tác riêng cho bạn.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/account/custom-orders/create">
            <Sparkles className="mr-2 h-4 w-4" /> Đặt đơn custom mới
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as FilterKey)} className="mb-6">
        <TabsList className="bg-surface-warm">
          {FILTERS.map(f => (
            <TabsTrigger key={f.key} value={f.key} className="data-[state=active]:bg-background">
              {f.label}
              <span className="ml-1.5 text-xs text-caption">({counts[f.key]})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="py-16 text-center text-caption">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Chưa có đơn nào"
          description="Bắt đầu hành trình lưu giữ vẻ đẹp của bạn ngay hôm nay."
          action={
            <Button asChild className="rounded-full">
              <Link to="/account/custom-orders/create">Tạo đơn custom</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
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
                        <p className="mt-1.5 text-sm text-body line-clamp-1">
                          {order.flowerType} · {order.personalizationContent}
                        </p>
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
                          <span className="text-caption">
                            Bước <strong className="text-heading">{step.current}/{step.total}</strong> · {step.label}
                          </span>
                          <span className="text-caption">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
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
  );
}
