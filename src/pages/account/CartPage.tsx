import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { removeCartItem, updateCartItemQuantity } from '@/lib/cart';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount } = useCart();

  return (
    <div className="container max-w-4xl py-8">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-caption hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm
      </Link>

      <h1 className="mb-6 font-heading text-2xl font-bold text-heading">Giỏ hàng</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-caption">Giỏ hàng của bạn đang trống.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-heading">{item.name}</p>
                  <p className="text-sm text-caption">{item.price.toLocaleString('vi-VN')}₫</p>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateCartItemQuantity(item.productId, Number(e.target.value) || 1)}
                  className="w-20"
                />
                <p className="w-28 text-right font-medium text-heading">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCartItem(item.productId)}
                  aria-label={`Xóa ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-caption">Tổng cộng</span>
                <span className="font-semibold text-heading">{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-end">
                <Button className="rounded-full px-8" onClick={() => navigate('/account/orders/create')}>
                  Tiến hành đặt hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
