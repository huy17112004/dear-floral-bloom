import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressCard } from '@/components/shared/AddressCard';
import { ArrowLeft, Check, BanknoteIcon, QrCode, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { customOrderApi, meApi, productApi } from '@/api';
import { mapAddress, mapProduct } from '@/api/mappers';
import type { CustomerAddress, Product } from '@/types';
import { toast } from 'sonner';

// ─── Bank info (hardcoded – update manually later) ────────────────────────────
const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountHolder: 'NGUYEN VAN A',
};

// ─── QR Payment Screen ────────────────────────────────────────────────────────
function DepositPaymentScreen({
  orderId,
  orderCode,
  depositAmount,
  onConfirmed,
}: {
  orderId: number;
  orderCode: string;
  depositAmount: number;
  onConfirmed: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const qrContent = `${BANK_INFO.bankName}|${BANK_INFO.accountNumber}|${depositAmount}|${orderCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await customOrderApi.confirmDepositTransfer(orderId);
      toast.success('Đã gửi xác nhận, chờ cửa hàng kiểm tra!');
      onConfirmed();
      navigate(`/account/custom-orders/${orderId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xác nhận';
      toast.error(message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-2 font-heading text-2xl font-bold text-heading">Thanh toán đặt cọc</h1>
      <p className="mb-6 text-sm text-caption">
        Mã đơn: <span className="font-medium text-heading">{orderCode}</span>
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" /> Quét QR chuyển khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <img
              src={qrUrl}
              alt="QR Code chuyển khoản"
              className="h-48 w-48 rounded-lg border"
            />
            <p className="text-xs text-caption">Quét bằng app ngân hàng bất kỳ</p>
          </CardContent>
        </Card>

        {/* Bank info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-base">
              <BanknoteIcon className="h-4 w-4" /> Thông tin chuyển khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-caption">Ngân hàng</span>
              <span className="font-medium text-heading">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-caption">Số tài khoản</span>
              <span className="font-mono font-semibold text-heading">{BANK_INFO.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-caption">Chủ tài khoản</span>
              <span className="font-medium text-heading">{BANK_INFO.accountHolder}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-caption">Số tiền cọc</span>
              <span className="font-bold text-primary">
                {depositAmount.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-caption">Nội dung CK</span>
              <span className="font-mono font-semibold text-heading">{orderCode}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notice */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Sau khi chuyển khoản, nhấn <strong>"Tôi đã chuyển tiền"</strong> để thông báo cửa hàng.
          Đơn hàng sẽ được xác nhận trong vòng 1–2 giờ làm việc.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 rounded-full"
          onClick={() => void handleConfirm()}
          disabled={confirming}
        >
          {confirming ? 'Đang gửi...' : '✅ Tôi đã chuyển tiền'}
        </Button>
        <Link to={`/account/custom-orders/${orderId}`} className="flex-1">
          <Button variant="outline" className="w-full rounded-full">
            Xem đơn hàng
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Create Form ──────────────────────────────────────────────────────────────
export default function CreateCustomOrderPage() {
  const [frames, setFrames] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [flowerType, setFlowerType] = useState('');
  const [personalizationContent, setPersonalizationContent] = useState('');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');
  const [flowerInputImage, setFlowerInputImage] = useState('');

  // After successful creation
  const [createdOrder, setCreatedOrder] = useState<{
    orderId: number;
    orderCode: string;
    depositAmount: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [framesResponse, addressesResponse] = await Promise.all([
          productApi.getCustomSelectableProducts({ page: 0, limit: 100 }),
          meApi.getMyAddresses(),
        ]);

        setFrames(framesResponse.data.map(mapProduct));
        const mappedAddresses = addressesResponse.data.map(mapAddress);
        setAddresses(mappedAddresses);
        setSelectedAddress(mappedAddresses[0]?.id ?? '');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu tạo đơn custom';
        toast.error(message);
      }
    };

    void load();
  }, []);

  const selectedFrameObj = frames.find(f => f.id === selectedFrame);

  const onSubmit = async () => {
    if (!selectedFrame || !selectedAddress || !flowerType) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await customOrderApi.createCustomOrder({
        selectedFrameProductId: Number(selectedFrame),
        shippingAddressId: Number(selectedAddress),
        flowerType,
        personalizationContent,
        requestedDeliveryDate: requestedDeliveryDate || undefined,
        flowerInputImage: flowerInputImage || undefined,
        depositPaymentMethod: 'bank_transfer',
      });

      const depositAmount = selectedFrameObj
        ? Math.round(selectedFrameObj.price * 0.5)
        : 0;

      setCreatedOrder({
        orderId: response.data.orderId,
        orderCode: response.data.orderCode,
        depositAmount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tạo đơn custom thất bại';
      toast.error(message);
    }
  };

  // ── Show payment screen after creation ──
  if (createdOrder) {
    return (
      <DepositPaymentScreen
        orderId={createdOrder.orderId}
        orderCode={createdOrder.orderCode}
        depositAmount={createdOrder.depositAmount}
        onConfirmed={() => setCreatedOrder(null)}
      />
    );
  }

  // ── Create form ──
  return (
    <div className="container max-w-3xl py-8">
      <Link to="/custom-order" className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>
      <h1 className="mb-8 font-heading text-2xl font-bold text-heading">Tạo đơn hàng Custom</h1>

      <div className="space-y-8">
        {/* Step 1: Select frame */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">1. Chọn khung tranh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {frames.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={cn(
                    'relative overflow-hidden rounded-xl border p-3 text-left transition-all',
                    selectedFrame === frame.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                  )}
                >
                  {selectedFrame === frame.id && (
                    <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-2">
                    <img src={frame.imageUrl} alt={frame.name} className="h-full w-full object-cover" />
                  </div>
                  <h4 className="text-sm font-medium text-heading">{frame.name}</h4>
                  <p className="text-xs text-caption">{frame.size} · {frame.material}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{frame.price.toLocaleString('vi-VN')}₫</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">2. Thông tin yêu cầu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Loại hoa *</Label>
              <Input placeholder="VD: Hoa hồng, hoa cúc..." className="mt-1" value={flowerType} onChange={e => setFlowerType(e.target.value)} />
            </div>
            <div>
              <Label>Nội dung cá nhân hóa</Label>
              <Textarea
                placeholder="Mô tả thiết kế mong muốn, chữ khắc, phong cách..."
                rows={3}
                className="mt-1"
                value={personalizationContent}
                onChange={e => setPersonalizationContent(e.target.value)}
              />
            </div>
            <div>
              <Label>Ngày mong muốn nhận hàng</Label>
              <Input type="date" className="mt-1" value={requestedDeliveryDate} onChange={e => setRequestedDeliveryDate(e.target.value)} />
            </div>
            <div>
              <Label>Ảnh hoa thực tế</Label>
              <Input
                className="mt-1"
                placeholder="URL ảnh hoa đầu vào"
                value={flowerInputImage}
                onChange={e => setFlowerInputImage(e.target.value)}
              />
              <p className="mt-1 text-xs text-caption">Nhập URL ảnh hoa bạn cung cấp.</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Address */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">3. Địa chỉ giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                address={addr}
                selectable
                selected={selectedAddress === addr.id}
                onSelect={() => setSelectedAddress(addr.id)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Step 4: Deposit info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">4. Đặt cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-body">
              Sau khi gửi yêu cầu, hệ thống sẽ hiển thị thông tin chuyển khoản đặt cọc <strong>50%</strong> giá trị đơn hàng.
            </p>
            {selectedFrameObj && (
              <div className="rounded-lg bg-surface-warm p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-caption">Giá trị khung</span>
                  <span className="text-heading">{selectedFrameObj.price.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-caption">Tiền cọc (50%)</span>
                  <span className="text-primary">{Math.round(selectedFrameObj.price * 0.5).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/custom-order"><Button variant="outline" className="rounded-full">Hủy</Button></Link>
          <Button onClick={() => void onSubmit()} className="rounded-full px-8">
            Gửi yêu cầu đặt hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
