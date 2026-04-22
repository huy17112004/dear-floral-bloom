import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressCard } from '@/components/shared/AddressCard';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { customOrderApi, meApi, productApi } from '@/api';
import { mapAddress, mapProduct } from '@/api/mappers';
import type { CustomerAddress, Product } from '@/types';
import { toast } from 'sonner';

export default function CreateCustomOrderPage() {
  const [frames, setFrames] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [flowerType, setFlowerType] = useState('');
  const [personalizationContent, setPersonalizationContent] = useState('');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');
  const [flowerInputImage, setFlowerInputImage] = useState('');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('bank_transfer');

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

  const onSubmit = async () => {
    if (!selectedFrame || !selectedAddress || !flowerType || !flowerInputImage) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }

    try {
      await customOrderApi.createCustomOrder({
        selectedFrameProductId: Number(selectedFrame),
        shippingAddressId: Number(selectedAddress),
        flowerType,
        personalizationContent,
        requestedDeliveryDate: requestedDeliveryDate || undefined,
        flowerInputImage,
        depositPaymentMethod,
      });
      toast.success('Tạo đơn custom thành công');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tạo đơn custom thất bại';
      toast.error(message);
    }
  };

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
              <Label>Loại hoa</Label>
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
              <p className="mt-1 text-xs text-caption">Backend hiện nhận chuỗi URL cho flowerInputImage.</p>
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

        {/* Step 4: Deposit */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">4. Đặt cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-body">
              Sau khi gửi yêu cầu, bạn sẽ cần thanh toán đặt cọc theo chính sách của Dear Floral.
            </p>
            <div className="rounded-lg bg-surface-warm p-3 text-sm">
              <div className="flex justify-between"><span className="text-caption">Phương thức</span><span className="text-heading">Chuyển khoản ngân hàng</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/custom-order"><Button variant="outline" className="rounded-full">Hủy</Button></Link>
          <Button onClick={onSubmit} className="rounded-full px-8">Gửi yêu cầu đặt hàng</Button>
        </div>
      </div>
    </div>
  );
}
