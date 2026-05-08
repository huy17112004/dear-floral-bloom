import type { Product } from '@/types';

const CART_STORAGE_KEY = 'customerCart';
const CART_CHANGED_EVENT = 'customer-cart-changed';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.imageUrl === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function emitCartChanged() {
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function getCartItems(): CartItem[] {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartChanged();
}

export function addProductToCart(product: Product, quantity: number) {
  const sanitizedQty = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  const items = getCartItems();
  const index = items.findIndex(item => item.productId === product.id);
  if (index >= 0) {
    items[index] = { ...items[index], quantity: items[index].quantity + sanitizedQty };
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: sanitizedQty,
    });
  }
  saveCartItems(items);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const items = getCartItems();
  const sanitizedQty = Math.max(1, Math.floor(quantity));
  const nextItems = items.map(item =>
    item.productId === productId ? { ...item, quantity: sanitizedQty } : item
  );
  saveCartItems(nextItems);
}

export function removeCartItem(productId: string) {
  const items = getCartItems().filter(item => item.productId !== productId);
  saveCartItems(items);
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  emitCartChanged();
}

export function subscribeCartChanged(callback: () => void): () => void {
  const listener = () => callback();
  const storageListener = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) callback();
  };
  window.addEventListener(CART_CHANGED_EVENT, listener);
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
}
