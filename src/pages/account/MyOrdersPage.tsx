import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { customOrderApi, availableOrderApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import { mapAvailableOrder } from '@/api/mappers';
import { getCustomOrderStepLabel } from '@/components/shared/CustomOrderProgress';
import type { CustomOrder, AvailableOrder, CustomOrderStatus } from '@/types';
import { toast } from 'sonner';

type CustomFilterKey = 'all' | 'in_progress' | 'completed' | 'canceled';

const CUSTOM_FILTERS: { key: CustomFilterKey; label: string }[] = [
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

export default function MyOrdersPage() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [customFilter, setCustomFilter] = useState<CustomFilterKey>('all');
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

  const filteredCustom = useMemo(() => {
    if (customFilter === 'all') return customOrders;
    if (customFilter === 'in_progress') return customOrders.filter(o => IN_PROGRESS_STATUSES.includes(o.orderStatus));
    return customOrders.filter(o => o.orderStatus === customFilter);
  }, [customOrders, customFilter]);

  const customCounts = useMemo(() => ({
    all: customOrders.length,
    in_progress: customOrders.filter(o => IN_PROGRESS_STATUSES.includes(o.orderStatus)).length,
    completed: customOrders.filter(o => o.orderStatus === 'completed').length,
    canceled: customOrders.filter(o => o.orderStatus === 'canceled').length,
  }), [customOrders]);

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
              Đơn hàng bình thường
              <span className="ml-1.5 text-xs text-caption">({availableOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-background">
              Đơn custom
              <span className="ml-1.5 text-xs text-caption">({customOrders.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {availableOrders.length === 0 ? (
              <EmptyState
                title="Chưa có đơn hàng nào"
                description="Khám phá những sản phẩm tuyệt vời từ chúng tôi."
                action={
                  <Button asChild className="rounded-full">
                    <Link to="/products">Xem sản phẩm</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {availableOrders.map(order => (
                  <Link key={order.id} to={`/account/orders/${order.id}`}>
                    <Card className="transition-all hover:border-primary/40 hover:shadow-md">
                      <CardContent className="flex items-center justify-between p-5">
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
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            {customOrders.length === 0 ? (
              <EmptyState
                title="Chưa có đơn custom nào"
                description="Bắt đầu hành trình lưu giữ vẻ đẹp của bạn ngay hôm nay."
                action={
                  <Button asChild className="rounded-full">
                    <Link to="/account/custom-orders/create">Tạo đơn custom</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Tabs value={customFilter} onValueChange={v => setCustomFilter(v as CustomFilterKey)} className="mb-6">
                  <TabsList className="bg-surface-warm">
                    {CUSTOM_FILTERS.map(f => (
                      <TabsTrigger key={f.key} value={f.key} className="data-[state=active]:bg-background">
                        {f.label}
                        <span className="ml-1.5 text-xs text-caption">({customCounts[f.key]})</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {filteredCustom.length === 0 ? (
                  <EmptyState
                    title="Không có đơn nào"
                    description="Không tìm thấy đơn custom theo điều kiện lọc."
                  />
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
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
