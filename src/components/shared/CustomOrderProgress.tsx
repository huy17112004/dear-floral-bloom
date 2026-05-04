import { Check, Coins, Sparkles, Image as ImageIcon, Wallet, PackageCheck, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomOrderStatus } from '@/types';

interface Step {
  key: CustomOrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { key: 'deposited', label: 'Đặt cọc', description: 'Đơn hàng đã được tiếp nhận', icon: Coins },
  { key: 'waiting_flower_review', label: 'Đánh giá hoa', description: 'Tiệm kiểm tra hoa đầu vào', icon: Leaf },
  { key: 'in_progress', label: 'Đang thực hiện', description: 'Nghệ nhân ép và dựng khung', icon: Sparkles },
  { key: 'waiting_demo_feedback', label: 'Duyệt demo', description: 'Bạn xem và phản hồi bản demo', icon: ImageIcon },
  { key: 'waiting_remaining_payment', label: 'Thanh toán còn lại', description: 'Hoàn tất khoản thanh toán', icon: Wallet },
  { key: 'waiting_remaining_payment_verification', label: 'Chờ xác nhận tiền', description: 'Cửa hàng kiểm tra giao dịch', icon: Wallet },
  { key: 'delivering', label: 'Đang giao hàng', description: 'Đơn hàng đang được vận chuyển', icon: PackageCheck },
  { key: 'completed', label: 'Hoàn thành', description: 'Sản phẩm sẵn sàng giao đến bạn', icon: PackageCheck },
];

interface Props {
  currentStatus: CustomOrderStatus;
  className?: string;
}

export function CustomOrderProgress({ currentStatus, className }: Props) {
  if (currentStatus === 'canceled' || currentStatus === 'refunded') {
    return (
      <div className={cn('rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive', className)}>
        {currentStatus === 'refunded' ? 'Đơn hàng đã hoàn tiền.' : 'Đơn hàng đã bị huỷ.'}
      </div>
    );
  }

  // Map pending statuses to their corresponding step
  const statusMapping: Record<CustomOrderStatus, CustomOrderStatus> = {
    pending_deposit: 'deposited',
    pending_deposit_verification: 'deposited',
    waiting_refund_info: 'deposited',
    waiting_refund: 'deposited',
  } as any;

  const effectiveStatus = statusMapping[currentStatus] || currentStatus;
  const currentIdx = STEPS.findIndex(s => s.key === effectiveStatus);

  return (
    <div className={cn('rounded-2xl border bg-surface-warm p-6', className)}>
      <ol className="hidden md:flex items-start justify-between gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex flex-1 flex-col items-center text-center">
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-5 left-1/2 h-0.5 w-full',
                    isDone ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isDone && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-background text-primary ring-4 ring-primary/15',
                  !isDone && !isCurrent && 'border-border bg-background text-caption',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className={cn('mt-3 text-xs font-medium', isCurrent ? 'text-heading' : isDone ? 'text-body' : 'text-caption')}>
                {step.label}
              </span>
              {isCurrent && <span className="mt-1 text-[11px] leading-tight text-caption max-w-[140px]">{step.description}</span>}
            </li>
          );
        })}
      </ol>

      <ol className="md:hidden space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2',
                    isDone && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary ring-4 ring-primary/15',
                    !isDone && !isCurrent && 'border-border bg-background text-caption',
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                {idx < STEPS.length - 1 && <span className={cn('mt-1 w-0.5 flex-1 min-h-[24px]', isDone ? 'bg-primary' : 'bg-border')} />}
              </div>
              <div className="pb-2">
                <p className={cn('text-sm font-medium', isCurrent ? 'text-heading' : isDone ? 'text-body' : 'text-caption')}>
                  {step.label}
                </p>
                <p className="text-xs text-caption">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function getCustomOrderStepLabel(status: CustomOrderStatus): { current: number; total: number; label: string } {
  if (status === 'canceled') return { current: 0, total: STEPS.length, label: 'Đã huỷ' };
  if (status === 'refunded') return { current: 0, total: STEPS.length, label: 'Đã hoàn tiền' };
  
  const statusMapping: Record<CustomOrderStatus, CustomOrderStatus> = {
    pending_deposit: 'deposited',
    pending_deposit_verification: 'deposited',
    waiting_refund_info: 'deposited',
    waiting_refund: 'deposited',
  } as any;

  const effectiveStatus = statusMapping[status] || status;
  const idx = STEPS.findIndex(s => s.key === effectiveStatus);
  const safe = idx === -1 ? 0 : idx;
  return { current: safe + 1, total: STEPS.length, label: STEPS[safe]?.label ?? '' };
}
