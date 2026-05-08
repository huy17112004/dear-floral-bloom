import { Check, PackageCheck, PackageSearch, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AvailableOrderStatus } from '@/types';

interface Step {
  key: AvailableOrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { key: 'received', label: 'Đã tiếp nhận', description: 'Đơn hàng đã được tiếp nhận', icon: PackageCheck },
  { key: 'processing', label: 'Đang chuẩn bị', description: 'Cửa hàng đang chuẩn bị hàng', icon: PackageSearch },
  { key: 'shipping', label: 'Đang giao', description: 'Đơn hàng đang được giao đến bạn', icon: Truck },
  { key: 'completed', label: 'Hoàn thành', description: 'Đơn hàng đã giao thành công', icon: Check },
];

interface Props {
  currentStatus: AvailableOrderStatus;
  className?: string;
}

export function AvailableOrderProgress({ currentStatus, className }: Props) {
  if (currentStatus === 'canceled') {
    return (
      <div className={cn('rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive', className)}>
        Đơn hàng đã bị huỷ.
      </div>
    );
  }
  if (currentStatus === 'waiting_refund_info' || currentStatus === 'waiting_refund' || currentStatus === 'refunded') {
    return (
      <div className={cn('rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700', className)}>
        {currentStatus === 'waiting_refund_info' && 'Đơn đã bị từ chối. Vui lòng nhập thông tin hoàn tiền.'}
        {currentStatus === 'waiting_refund' && 'Cửa hàng đang xử lý hoàn tiền cho đơn hàng của bạn.'}
        {currentStatus === 'refunded' && 'Đơn hàng đã được hoàn tiền.'}
      </div>
    );
  }

  const currentIdx = STEPS.findIndex(s => s.key === currentStatus);

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
                  className={cn('absolute top-5 left-1/2 h-0.5 w-full', isDone ? 'bg-primary' : 'bg-border')}
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
