import { useEffect, useState } from 'react';
import { getCartItems, subscribeCartChanged, type CartItem } from '@/lib/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());

  useEffect(() => {
    return subscribeCartChanged(() => {
      setItems(getCartItems());
    });
  }, []);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, totalQuantity, totalAmount };
}
