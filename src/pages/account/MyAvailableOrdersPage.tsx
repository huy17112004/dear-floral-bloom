import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { availableOrderApi } from '@/api';
import { mapAvailableOrder } from '@/api/mappers';
import type { AvailableOrder } from '@/types';
import { toast } from 'sonner';

export default function MyAvailableOrdersPage() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await availableOrderApi.getMyAvailableOrders({ page: 0, limit: 100 });
        setOrders(response.data.map(mapAvailableOrder));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-heading">Đơn hàng của tôi</h1>

      {loading && <p className="text-sm text-caption">Đang tải dữ liệu...</p>}

      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/account/orders/${order.id}`}>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-semibold text-heading">{order.orderCode}</span>
                    <StatusBadge type="availableOrder" status={order.orderStatus} />
                  </div>
                  <p className="mt-1 text-sm text-caption">
                    {new Date(order.orderedAt).toLocaleDateString('vi-VN')} · {order.totalAmount.toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-caption" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
