import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BanknoteIcon, QrCode, Clock } from 'lucide-react';
import { customOrderApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import { CustomOrderProgress } from '@/components/shared/CustomOrderProgress';
import type { CustomDemo, CustomOrder } from '@/types';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/image';

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountHolder: 'NGUYEN VAN A',
};

export default function CustomOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [demos, setDemos] = useState<CustomDemo[]>([]);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [confirmingDeposit, setConfirmingDeposit] = useState(false);
  const [submittingRemaining, setSubmittingRemaining] = useState(false);
  const [refundBankName, setRefundBankName] = useState('');
  const [refundAccountNumber, setRefundAccountNumber] = useState('');
  const [refundAccountName, setRefundAccountName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const [orderResponse, demosResponse] = await Promise.all([
        customOrderApi.getCustomOrderDetail(Number(id)),
        customOrderApi.getCustomOrderDemos(Number(id)),
      ]);
      const mappedOrder = mapCustomOrder(orderResponse.data);
      const mappedDemos: CustomDemo[] = demosResponse.data.map(demo => ({
        id: String(demo.demoId),
        customOrderId: String(demo.orderId),
        versionNo: demo.versionNo,
        demoImageUrl: resolveImageUrl(demo.demoImageUrl || '/placeholder.svg'),
        demoImages: (demo.demoImages && demo.demoImages.length > 0 ? demo.demoImages : [demo.demoImageUrl || '/placeholder.svg']).map(resolveImageUrl),
        demoDescription: demo.demoDescription,
        customerResponseStatus: (demo.customerResponseStatus || 'pending').toLowerCase() as CustomDemo['customerResponseStatus'],
        customerFeedback: demo.customerFeedback,
        uploadedBy: '',
        uploadedAt: demo.uploadedAt || '',
        respondedAt: demo.respondedAt || undefined,
      }));
      setOrder(mappedOrder);
      setDemos(mappedDemos);
    } catch {
      toast.error('Không thể tải chi tiết đơn custom');
    }
  };

  useEffect(() => { void loadOrder(); }, [id]);

  const frameName = useMemo(() => order?.selectedFrame?.name || '—', [order]);
  const latestDemoId = useMemo(() => {
    if (demos.length === 0) return '';
    return [...demos].sort((a, b) => b.versionNo - a.versionNo)[0]?.id ?? '';
  }, [demos]);

  const submitFeedback = async (demoId: string, action: 'approve' | 'request_revision') => {
    if (!id) return;
    try {
      await customOrderApi.feedbackCustomOrderDemo(Number(id), Number(demoId), {
        action,
        feedback: feedbackInputs[demoId] || undefined,
      });
      toast.success('Gửi phản hồi demo thành công');
      void loadOrder();
    } catch {
      toast.error('Không thể gửi phản hồi demo');
    }
  };

  const handleConfirmDeposit = async () => {
    if (!id) return;
    try {
      setConfirmingDeposit(true);
      await customOrderApi.confirmDepositTransfer(Number(id));
      toast.success('Đã gửi xác nhận, chờ cửa hàng kiểm tra');
      void loadOrder();
    } catch {
      toast.error('Không thể xác nhận');
    } finally {
      setConfirmingDeposit(false);
    }
  };

  const handleSubmitRemaining = async () => {
    if (!id) return;
    try {
      setSubmittingRemaining(true);
      await customOrderApi.payCustomOrderRemaining(Number(id), { paymentMethod: 'BANK_TRANSFER' });
      toast.success('Đã gửi xác nhận chuyển khoản phần còn lại');
      void loadOrder();
    } catch {
      toast.error('Không thể gửi xác nhận thanh toán');
    } finally {
      setSubmittingRemaining(false);
    }
  };

  const handleSubmitRefundInfo = async () => {
    if (!id) return;
    try {
      await customOrderApi.submitCustomOrderRefundInfo(Number(id), {
        refundBankName,
        refundAccountNumber,
        refundAccountName,
      });
      toast.success('Đã gửi thông tin hoàn tiền');
      void loadOrder();
    } catch {
      toast.error('Không thể gửi thông tin hoàn tiền');
    }
  };

  if (!order) return <div className="container py-16 text-center text-caption">Đơn hàng không tồn tại.</div>;

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/account/custom-orders" className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-heading">{order.orderCode}</h1>
        <StatusBadge type="customOrder" status={order.orderStatus} />
      </div>

      <div className="mb-6">
        <CustomOrderProgress currentStatus={order.orderStatus} />
      </div>

      <div className="space-y-6">
        {(order.orderStatus === 'pending_deposit' || order.orderStatus === 'pending_deposit_verification') && (
          <Card className={order.orderStatus === 'pending_deposit' ? 'border-primary' : 'border-sky-300'}>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-base">
                <BanknoteIcon className="h-4 w-4" />
                {order.orderStatus === 'pending_deposit' ? 'Thanh toán đặt cọc' : 'Đang chờ xác nhận cọc'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderStatus === 'pending_deposit' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${BANK_INFO.bankName}|${BANK_INFO.accountNumber}|${order.depositAmount}|${order.orderCode}`)}`} alt="QR chuyển khoản" className="h-40 w-40 rounded-lg border" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-caption">Ngân hàng</span><span className="font-medium">{BANK_INFO.bankName}</span></div>
                      <div className="flex justify-between"><span className="text-caption">Số TK</span><span className="font-mono font-semibold">{BANK_INFO.accountNumber}</span></div>
                      <div className="flex justify-between"><span className="text-caption">Chủ TK</span><span className="font-medium">{BANK_INFO.accountHolder}</span></div>
                      <div className="flex justify-between border-t pt-2"><span className="text-caption">Số tiền</span><span className="font-bold text-primary">{order.depositAmount.toLocaleString('vi-VN')}₫</span></div>
                      <div className="flex justify-between"><span className="text-caption">Nội dung CK</span><span className="font-mono font-semibold">{order.orderCode}</span></div>
                    </div>
                  </div>
                  <Button className="w-full rounded-full" onClick={() => void handleConfirmDeposit()} disabled={confirmingDeposit}>
                    {confirmingDeposit ? 'Đang gửi...' : 'Tôi đã chuyển tiền'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-sky-700">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Đã nhận xác nhận của bạn. Cửa hàng đang kiểm tra giao dịch.</p>
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

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Thông tin đơn hàng</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-caption">Khung tranh</span><span className="text-heading font-medium">{frameName}</span></div>
            <div className="flex justify-between"><span className="text-caption">Loại hoa</span><span className="text-heading">{order.flowerType}</span></div>
            <div className="flex justify-between"><span className="text-caption">Yêu cầu</span><span className="text-heading text-right max-w-[60%]">{order.personalizationContent}</span></div>
            {order.requestedDeliveryDate && <div className="flex justify-between"><span className="text-caption">Ngày mong muốn</span><span className="text-heading">{new Date(order.requestedDeliveryDate).toLocaleDateString('vi-VN')}</span></div>}
            <div className="flex justify-between"><span className="text-caption">Đánh giá hoa</span><StatusBadge type="flowerEval" status={order.flowerEvaluationStatus} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Thanh toán</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-caption">Đặt cọc</span><span className="text-heading font-medium">{order.depositAmount.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between"><span className="text-caption">Còn lại</span><span className="text-heading font-medium">{order.remainingAmount.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-medium text-heading">Tổng cộng</span><span className="font-bold text-heading">{order.totalAmount.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between"><span className="text-caption">Trạng thái</span><StatusBadge type="payment" status={order.paymentStatus} /></div>
          </CardContent>
        </Card>

        {demos.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="font-heading text-base">Demo ({demos.length} phiên bản)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {demos.map(demo => (
                <div key={demo.id} className="rounded-xl border bg-surface-warm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-heading">Phiên bản {demo.versionNo}</span>
                    <StatusBadge type="demoResponse" status={demo.customerResponseStatus} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {(demo.demoImages && demo.demoImages.length > 0 ? demo.demoImages : [demo.demoImageUrl]).map((img, idx) => (
                      <div key={`${demo.id}-${idx}`} className="aspect-video rounded-lg bg-secondary overflow-hidden">
                        {/\.(mp4|webm|ogg)$/i.test(img || '')
                          ? <video src={img} controls className="h-full w-full object-cover" />
                          : <img src={img} alt={`Demo v${demo.versionNo}-${idx + 1}`} className="h-full w-full object-cover cursor-zoom-in" onClick={() => { setPreviewImage(img); setPreviewZoom(1); }} />}
                      </div>
                    ))}
                  </div>
                  {demo.demoDescription && <p className="text-sm text-body mb-3">{demo.demoDescription}</p>}
                  {demo.customerFeedback && <div className="rounded-lg bg-clay-light p-3"><p className="text-xs text-caption mb-1">Phản hồi của bạn:</p><p className="text-sm text-heading">{demo.customerFeedback}</p></div>}
                  {demo.customerResponseStatus === 'pending' && demo.id === latestDemoId && (
                    <div className="mt-4 space-y-3">
                      <Textarea placeholder="Nhập phản hồi chỉnh sửa (nếu có)..." value={feedbackInputs[demo.id] || ''} onChange={e => setFeedbackInputs(prev => ({ ...prev, [demo.id]: e.target.value }))} />
                      <div className="flex gap-2">
                        <Button className="rounded-full" onClick={() => void submitFeedback(demo.id, 'approve')}>Duyệt demo</Button>
                        <Button variant="outline" className="rounded-full" onClick={() => void submitFeedback(demo.id, 'request_revision')}>Yêu cầu chỉnh sửa</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.orderStatus === 'waiting_remaining_payment' && (
          <Card className="border-accent">
            <CardHeader><CardTitle className="font-heading text-base text-accent">Thanh toán phần còn lại</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="flex flex-col items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${BANK_INFO.bankName}|${BANK_INFO.accountNumber}|${order.remainingAmount}|${order.orderCode}`)}`} alt="QR chuyển khoản" className="h-40 w-40 rounded-lg border" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-caption">Ngân hàng</span><span className="font-medium">{BANK_INFO.bankName}</span></div>
                  <div className="flex justify-between"><span className="text-caption">Số TK</span><span className="font-mono font-semibold">{BANK_INFO.accountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-caption">Chủ TK</span><span className="font-medium">{BANK_INFO.accountHolder}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-caption">Số tiền</span><span className="font-bold text-primary">{order.remainingAmount.toLocaleString('vi-VN')}₫</span></div>
                  <div className="flex justify-between"><span className="text-caption">Nội dung CK</span><span className="font-mono font-semibold">{order.orderCode}</span></div>
                </div>
              </div>
              <Button className="rounded-full" onClick={() => void handleSubmitRemaining()} disabled={submittingRemaining}>
                {submittingRemaining ? 'Đang gửi...' : 'Tôi đã chuyển tiền'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-3 p-4" onClick={() => setPreviewImage(null)}>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setPreviewZoom(z => Math.max(0.5, z - 0.1)); }}>-</Button>
            <span className="text-white text-sm">{Math.round(previewZoom * 100)}%</span>
            <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setPreviewZoom(z => Math.min(3, z + 0.1)); }}>+</Button>
          </div>
          <img src={previewImage} alt="Preview" className="max-h-[80vh] max-w-[90vw] object-contain" style={{ transform: `scale(${previewZoom})` }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
