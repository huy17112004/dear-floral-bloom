import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BanknoteIcon, Clock, QrCode } from 'lucide-react';
import { availableOrderApi } from '@/api';
import { mapAvailableOrder } from '@/api/mappers';
import type { AvailableOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AvailableOrderProgress } from '@/components/shared/AvailableOrderProgress';
import { Input } from '@/components/ui/input';

const BANK_INFO = {
  bankName: 'MBBANK',
  accountNumber: '08663333326',
  accountHolder: 'HA HUYEN PHUONG',
};

function buildVietQrUrl(amount: number, transferContent: string) {
  const base = `https://img.vietqr.io/image/MB-${BANK_INFO.accountNumber}-compact2.png`;
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: transferContent,
    accountName: BANK_INFO.accountHolder,
  });
  return `${base}?${params.toString()}`;
}

export default function AvailableOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<AvailableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [refundBankName, setRefundBankName] = useState('');
  const [refundAccountNumber, setRefundAccountNumber] = useState('');
  const [refundAccountName, setRefundAccountName] = useState('');

  const loadOrder = async () => {
    const orderId = Number(id);
    if (!id || !Number.isFinite(orderId) || orderId <= 0) {
      toast.error('Mã đơn hàng không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const response = await availableOrderApi.getAvailableOrderDetail(orderId);
      setOrder(mapAvailableOrder(response.data));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải chi tiết đơn hàng';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  const handleConfirmTransfer = async () => {
    if (!id) return;
    try {
      setConfirmingPayment(true);
      await availableOrderApi.confirmAvailableOrderPayment(Number(id), {});
      toast.success('Đã gửi xác nhận chuyển khoản, vui lòng chờ cửa hàng duyệt');
      await loadOrder();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi xác nhận chuyển khoản';
      toast.error(message);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSubmitRefundInfo = async () => {
    if (!id) return;
    try {
      await availableOrderApi.submitAvailableOrderRefundInfo(Number(id), {
        refundBankName,
        refundAccountNumber,
        refundAccountName,
      });
      toast.success('Đã gửi thông tin hoàn tiền');
      await loadOrder();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi thông tin hoàn tiền';
      toast.error(message);
    }
  };

  const handleConfirmReceived = async () => {
    if (!id) return;
    try {
      await availableOrderApi.confirmAvailableOrderReceived(Number(id));
      toast.success('Đã xác nhận nhận được hàng');
      await loadOrder();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xác nhận nhận hàng';
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="container py-16 text-center text-caption">Đang tải dữ liệu...</div>;
  }

  if (!order) {
    return <div className="container py-16 text-center text-caption">Đơn hàng không tồn tại.</div>;
  }

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/account/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-heading">{order.orderCode}</h1>
        <StatusBadge type="availableOrder" status={order.orderStatus} />
      </div>

      <div className="mb-6">
        <AvailableOrderProgress currentStatus={order.orderStatus} />
      </div>

      <div className="space-y-6">
        {order.orderStatus === 'received' && (order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending') && (
          <Card className={order.paymentStatus === 'unpaid' ? 'border-primary' : 'border-sky-300'}>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-base">
                <BanknoteIcon className="h-4 w-4" />
                {order.paymentStatus === 'unpaid' ? 'Thanh toán chuyển khoản' : 'Đang chờ xác nhận thanh toán'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.paymentStatus === 'unpaid' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      <img
                        src={buildVietQrUrl(order.totalAmount, order.orderCode)}
                        alt="QR chuyển khoản"
                        className="h-40 w-40 rounded-lg border"
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-caption">Ngân hàng</span><span className="font-medium">{BANK_INFO.bankName}</span></div>
                      <div className="flex justify-between"><span className="text-caption">Số TK</span><span className="font-mono font-semibold">{BANK_INFO.accountNumber}</span></div>
                      <div className="flex justify-between"><span className="text-caption">Chủ TK</span><span className="font-medium">{BANK_INFO.accountHolder}</span></div>
                      <div className="flex justify-between border-t pt-2"><span className="text-caption">Số tiền</span><span className="font-bold text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</span></div>
                      <div className="flex justify-between"><span className="text-caption">Nội dung CK</span><span className="font-mono font-semibold">{order.orderCode}</span></div>
                    </div>
                  </div>
                  <Button className="w-full rounded-full" onClick={() => void handleConfirmTransfer()} disabled={confirmingPayment}>
                    {confirmingPayment ? 'Đang gửi...' : 'Tôi đã chuyển khoản'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-sky-700">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Cửa hàng đang kiểm tra giao dịch. Đơn sẽ chuyển sang chuẩn bị hàng sau khi xác nhận thanh toán.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {order.orderStatus === 'waiting_refund_info' && (
          <Card className="border-red-300">
            <CardHeader><CardTitle className="font-heading text-base text-red-700">Đơn bị từ chối, vui lòng nhập thông tin hoàn tiền</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.rejectionReason && <p className="text-sm"><b>Lý do:</b> {order.rejectionReason}</p>}
              <Input placeholder="Tên ngân hàng" value={refundBankName} onChange={e => setRefundBankName(e.target.value)} />
              <Input placeholder="Số tài khoản" value={refundAccountNumber} onChange={e => setRefundAccountNumber(e.target.value)} />
              <Input placeholder="Chủ tài khoản" value={refundAccountName} onChange={e => setRefundAccountName(e.target.value)} />
              <Button className="rounded-full" onClick={() => void handleSubmitRefundInfo()}>Gửi thông tin hoàn tiền</Button>
            </CardContent>
          </Card>
        )}

        {(order.refundBankName || order.refundAccountNumber || order.refundAccountName || order.orderStatus === 'waiting_refund' || order.orderStatus === 'refunded') && (
          <Card>
            <CardHeader><CardTitle className="font-heading text-base">Thông tin hoàn tiền</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-caption">Ngân hàng</span><span className="font-medium">{order.refundBankName || '—'}</span></div>
              <div className="flex justify-between"><span className="text-caption">Số tài khoản</span><span className="font-medium">{order.refundAccountNumber || '—'}</span></div>
              <div className="flex justify-between"><span className="text-caption">Chủ tài khoản</span><span className="font-medium">{order.refundAccountName || '—'}</span></div>
            </CardContent>
          </Card>
        )}

        {(order.shippingCarrier || order.shippingTrackingCode) && (
          <Card>
            <CardHeader><CardTitle className="font-heading text-base">Thông tin vận chuyển</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-caption">Đơn vị vận chuyển</span><span className="font-medium">{order.shippingCarrier || '—'}</span></div>
              <div className="flex justify-between"><span className="text-caption">Mã vận đơn</span><span className="font-mono font-semibold">{order.shippingTrackingCode || '—'}</span></div>
              {order.orderStatus === 'shipping' && (
                <Button className="mt-2 w-full rounded-full" onClick={() => void handleConfirmReceived()}>
                  Đã nhận được hàng
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Sản phẩm</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface-warm p-3">
                <div>
                  <span className="font-medium text-heading">{item.product?.name || item.productId}</span>
                  <span className="ml-2 text-sm text-caption">x{item.quantity}</span>
                </div>
                <span className="font-medium text-heading">{item.subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Thanh toán</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-caption">Tổng cộng</span><span className="font-semibold text-heading">{order.totalAmount.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between text-sm"><span className="text-caption">Trạng thái</span><StatusBadge type="payment" status={order.paymentStatus} /></div>
            {order.paymentMethod && <div className="flex justify-between text-sm"><span className="text-caption">Phương thức</span><span className="text-heading">{order.paymentMethod}</span></div>}
          </CardContent>
        </Card>

        {order.note && (
          <Card>
            <CardHeader><CardTitle className="font-heading text-base">Ghi chú</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-body">{order.note}</p></CardContent>
          </Card>
        )}

        {order.rejectionReason && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader><CardTitle className="font-heading text-base text-red-700">Lý do từ chối</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-red-900">{order.rejectionReason}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

