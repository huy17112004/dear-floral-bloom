import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressCrudSection } from '@/components/shared/AddressCrudSection';
import { availableOrderApi, productApi } from '@/api';
import { ApiError } from '@/api/client';
import { mapProduct } from '@/api/mappers';
import type { Product } from '@/types';
import { toast } from 'sonner';

export default function CreateAvailableOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const productId = useMemo(() => Number(searchParams.get('product')), [searchParams]);
  const quantity = useMemo(() => {
    const parsed = Number(searchParams.get('qty'));
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(productId) || productId <= 0) {
        toast.error('Sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        const productResponse = await productApi.getProductDetail(productId);
        setProduct(mapProduct(productResponse.data));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin đặt hàng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    if (!product || !selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    const shippingAddressId = Number(selectedAddress);
    const productIdNumber = Number(product.id);
    if (!Number.isFinite(shippingAddressId) || shippingAddressId <= 0) {
      toast.error('Địa chỉ giao hàng không hợp lệ.');
      return;
    }
    if (!Number.isFinite(productIdNumber) || productIdNumber <= 0) {
      toast.error('Mã sản phẩm không hợp lệ.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Số lượng không hợp lệ.');
      return;
    }
    if (product.productKind !== 'standard_product') {
      toast.error('Sản phẩm này không thể đặt theo đơn hàng thường.');
      return;
    }
    if (!product.isSellableDirectly) {
      toast.error('Sản phẩm này không bán trực tiếp.');
      return;
    }
    if (product.status !== 'active') {
      toast.error('Sản phẩm hiện không khả dụng để đặt hàng.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        shippingAddressId,
        paymentMethod: 'cash',
        note: note || undefined,
        items: [{ productId: productIdNumber, quantity }],
      };
      console.debug('createAvailableOrder payload', payload);
      const response = await availableOrderApi.createAvailableOrder(payload);
      toast.success('Đặt hàng thành công');
      navigate(`/account/orders/${response.data.orderId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('createAvailableOrder failed', {
          status: error.status,
          code: error.code,
          message: error.message,
          errors: error.errors,
        });
      }
      const message = error instanceof ApiError
        ? `${error.message}${error.code ? ` (${error.code})` : ''}${error.status ? ` [${error.status}]` : ''}`
        : error instanceof Error
          ? error.message
          : 'Đặt hàng thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container py-16 text-center text-caption">Đang tải dữ liệu...</div>;
  }

  if (!product) {
    return <div className="container py-16 text-center text-caption">Không tìm thấy sản phẩm để đặt hàng.</div>;
  }

  return (
    <div className="container max-w-3xl py-8">
      <Link to={`/products/${product.id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại sản phẩm
      </Link>

      <h1 className="mb-6 font-heading text-2xl font-bold text-heading">Xác nhận đặt hàng</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Sản phẩm</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-caption">Tên</span><span className="text-heading font-medium">{product.name}</span></div>
            <div className="flex justify-between"><span className="text-caption">Số lượng</span><span className="text-heading font-medium">{quantity}</span></div>
            <div className="flex justify-between"><span className="text-caption">Đơn giá</span><span className="text-heading font-medium">{product.price.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between"><span className="text-caption">Tổng cộng</span><span className="text-heading font-semibold">{(product.price * quantity).toLocaleString('vi-VN')}₫</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Địa chỉ giao hàng</CardTitle></CardHeader>
          <CardContent>
            <AddressCrudSection
              selectable
              selectedAddressId={selectedAddress}
              onSelectAddress={setSelectedAddress}
              title="Chọn địa chỉ giao hàng"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Ghi chú</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="order-note" className="text-sm text-caption">Tùy chọn</Label>
            <Textarea id="order-note" className="mt-1" rows={3} value={note} onChange={e => setNote(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting} className="rounded-full px-8">
            {submitting ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng'}
          </Button>
        </div>
      </div>
    </div>
  );
}


