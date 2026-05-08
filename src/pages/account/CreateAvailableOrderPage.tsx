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
import { clearCart, getCartItems, type CartItem } from '@/lib/cart';

export default function CreateAvailableOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const productId = useMemo(() => Number(searchParams.get('product')), [searchParams]);
  const quantity = useMemo(() => {
    const parsed = Number(searchParams.get('qty'));
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      const currentCart = getCartItems();
      if (currentCart.length > 0) {
        setItems(currentCart);
        setLoading(false);
        return;
      }

      if (!Number.isFinite(productId) || productId <= 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const productResponse = await productApi.getProductDetail(productId);
        const product = mapProduct(productResponse.data);
        if (
          product.productKind !== 'standard_product' ||
          !product.isSellableDirectly ||
          product.status !== 'active'
        ) {
          toast.error('Sản phẩm không khả dụng để đặt hàng.');
          setItems([]);
        } else {
          setItems([
            {
              productId: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
              quantity,
            },
          ]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin đặt hàng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId, quantity]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng trống, không thể tạo đơn.');
      return;
    }

    const shippingAddressId = Number(selectedAddress);
    if (!Number.isFinite(shippingAddressId) || shippingAddressId <= 0) {
      toast.error('Địa chỉ giao hàng không hợp lệ.');
      return;
    }

    const payloadItems = items
      .map(item => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }))
      .filter(item => Number.isFinite(item.productId) && item.productId > 0 && item.quantity > 0);

    if (payloadItems.length === 0) {
      toast.error('Không có sản phẩm hợp lệ để đặt hàng.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await availableOrderApi.createAvailableOrder({
        shippingAddressId,
        paymentMethod: 'bank_transfer',
        note: note || undefined,
        items: payloadItems,
      });
      clearCart();
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

  if (items.length === 0) {
    return <div className="container py-16 text-center text-caption">Không có sản phẩm để đặt hàng.</div>;
  }

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/account/cart" className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
      </Link>

      <h1 className="mb-6 font-heading text-2xl font-bold text-heading">Xác nhận đặt hàng</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-heading text-base">Sản phẩm</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-heading font-medium">{item.name} x{item.quantity}</span>
                <span className="text-heading">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3">
              <span className="text-caption">Tổng cộng</span>
              <span className="text-heading font-semibold">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
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
