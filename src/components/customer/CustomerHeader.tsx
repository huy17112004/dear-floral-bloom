import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, User, ShoppingBag, Flower2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/useCart';
import { clearCart } from '@/lib/cart';

const navLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Sản phẩm', path: '/products' },
  { label: 'Đặt hàng Custom', path: '/custom-order' },
  { label: 'Về chúng tôi', path: '/about' },
  { label: 'Liên hệ', path: '/contact' },
];

export function CustomerHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const { items, totalQuantity, totalAmount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    clearCart();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <Flower2 className="h-7 w-7 text-primary" />
          <span className="font-heading text-xl font-semibold text-heading">Dear Floral</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? 'text-primary' : 'text-body'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <>
              <Link to="/account/orders">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-foreground">
                    <ShoppingBag className="h-5 w-5" />
                    {totalQuantity > 0 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {totalQuantity}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-3">
                  <p className="mb-2 text-sm font-semibold text-heading">Giỏ hàng</p>
                  {items.length === 0 ? (
                    <p className="text-sm text-caption">Chưa có sản phẩm nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {items.slice(0, 3).map(item => (
                        <div key={item.productId} className="flex items-center justify-between gap-3">
                          <p className="line-clamp-1 flex-1 text-sm text-body">{item.name} x{item.quantity}</p>
                          <p className="text-sm font-medium text-heading">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-caption">+{items.length - 3} sản phẩm khác</p>
                      )}
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm text-caption">Tổng</span>
                        <span className="text-sm font-semibold text-heading">{totalAmount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  )}
                  <Button asChild className="mt-3 w-full rounded-full">
                    <Link to="/account/cart">Xem giỏ hàng</Link>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/account/profile">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout}>
              Đăng xuất
            </Button>
          ) : (
            <Button
              variant="outline"
              className="hidden md:inline-flex"
              onClick={() => navigate('/auth/login')}
            >
              Đăng nhập
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-background p-4 md:hidden">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-sm font-medium transition-colors ${
                location.pathname === link.path ? 'text-primary' : 'text-body'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 border-t pt-3">
            {isLoggedIn && (
              <Button asChild variant="ghost" className="mb-2 w-full justify-start">
                <Link to="/account/cart" onClick={() => setMobileOpen(false)}>
                  Giỏ hàng {totalQuantity > 0 ? `(${totalQuantity})` : ''}
                </Link>
              </Button>
            )}
            {isLoggedIn ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                Đăng xuất
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/auth/login');
                }}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
