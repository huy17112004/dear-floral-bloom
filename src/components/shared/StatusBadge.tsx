import { Badge } from '@/components/ui/badge';
import type { AvailableOrderStatus, CustomOrderStatus, PaymentStatus, FlowerEvaluationStatus, DemoResponseStatus, DeliveryStatus } from '@/types';
import { cn } from '@/lib/utils';

const availableOrderLabels: Record<AvailableOrderStatus, { label: string; className: string }> = {
  received: { label: 'Đã tiếp nhận', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Đang xử lý', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  shipping: { label: 'Đang giao', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-800 border-green-200' },
  canceled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 border-red-200' },
};

const customOrderLabels: Record<CustomOrderStatus, { label: string; className: string }> = {
  pending_deposit: { label: 'Chờ đặt cọc', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  pending_deposit_verification: { label: 'Đang xác nhận cọc', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  deposited: { label: 'Đã đặt cọc', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  waiting_flower_review: { label: 'Chờ đánh giá hoa', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'Đang thực hiện', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  waiting_demo_feedback: { label: 'Chờ duyệt demo', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  waiting_remaining_payment: { label: 'Chờ thanh toán', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  waiting_remaining_payment_verification: { label: 'Chờ xác nhận thanh toán', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  delivering: { label: 'Đang giao hàng', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  waiting_refund_info: { label: 'Chờ thông tin hoàn tiền', className: 'bg-rose-100 text-rose-800 border-rose-200' },
  waiting_refund: { label: 'Chờ hoàn tiền', className: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-800 border-green-200' },
  canceled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 border-red-200' },
};

const paymentLabels: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: { label: 'Chưa thanh toán', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800 border-green-200' },
  partial: { label: 'Đã cọc', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-red-100 text-red-800 border-red-200' },
};

const flowerEvalLabels: Record<FlowerEvaluationStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ đánh giá', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  pass: { label: 'Đạt yêu cầu', className: 'bg-green-100 text-green-800 border-green-200' },
  fail: { label: 'Không đạt', className: 'bg-red-100 text-red-800 border-red-200' },
};

const demoResponseLabels: Record<DemoResponseStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ phản hồi', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  approve: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800 border-green-200' },
  request_revision: { label: 'Yêu cầu chỉnh sửa', className: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const deliveryLabels: Record<DeliveryStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ giao', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  shipped: { label: 'Đang giao', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800 border-red-200' },
};

type StatusType = 'availableOrder' | 'customOrder' | 'payment' | 'flowerEval' | 'demoResponse' | 'delivery';

interface StatusBadgeProps {
  type: StatusType;
  status: string;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;

  switch (type) {
    case 'availableOrder': config = availableOrderLabels[status as AvailableOrderStatus]; break;
    case 'customOrder': config = customOrderLabels[status as CustomOrderStatus]; break;
    case 'payment': config = paymentLabels[status as PaymentStatus]; break;
    case 'flowerEval': config = flowerEvalLabels[status as FlowerEvaluationStatus]; break;
    case 'demoResponse': config = demoResponseLabels[status as DemoResponseStatus]; break;
    case 'delivery': config = deliveryLabels[status as DeliveryStatus]; break;
  }

  if (!config) return <Badge variant="secondary">{status}</Badge>;

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
