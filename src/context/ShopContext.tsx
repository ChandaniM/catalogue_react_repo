import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { FeatureFlags } from '../lib/featureFlags';
import { DEFAULT_FEATURE_FLAGS, loadFeatureFlags, saveFeatureFlags } from '../lib/featureFlags';

export type CartItem = {
  productId: string;
  quantity: number;
};

interface ShopContextValue {
  cart: CartItem[];
  wishlist: string[];
  featureFlags: FeatureFlags;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleCartItem: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  setFeatureFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'uphar_cart';
const WISHLIST_STORAGE_KEY = 'uphar_wishlist';

const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsed: unknown = JSON.parse(storedCart);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored cart must be an array');
    }

    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productId === 'string' &&
        item.productId.length > 0 &&
        typeof item.quantity === 'number' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
  } catch (error) {
    console.error('Unable to read saved cart:', error);
    return [];
  }
};

const loadWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!storedWishlist) return [];

    const parsed: unknown = JSON.parse(storedWishlist);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
      throw new Error('Stored wishlist must be an array of product IDs');
    }
    return parsed;
  } catch (error) {
    console.error('Unable to read saved wishlist:', error);
    return [];
  }
};

type CartToast = {
  id: number;
  message: string;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const cartRef = useRef(cart);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartToast, setCartToast] = useState<CartToast | null>(null);
  const cartToastId = useRef(0);

  const commitCart = (nextCart: CartItem[]) => {
    cartRef.current = nextCart;
    setCart(nextCart);
  };

  useEffect(() => {
    if (!cartToast) return;

    const timeout = window.setTimeout(() => setCartToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [cartToast]);

  useEffect(() => {
    setFeatureFlags(loadFeatureFlags());
  }, []);

  useEffect(() => {
    const syncCartFromStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      const nextCart = event.newValue ? loadCart() : [];
      cartRef.current = nextCart;
      setCart(nextCart);
    };

    window.addEventListener('storage', syncCartFromStorage);
    return () => window.removeEventListener('storage', syncCartFromStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const updateFlags = <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
    setFeatureFlags((current) => {
      const next = { ...current, [key]: value };
      saveFeatureFlags(next);
      return next;
    });
  };

  const getProductStock = (productId: string): number => {
    if (typeof window === 'undefined') {
      return 1;
    }

    try {
      const storedProducts = localStorage.getItem('uphar_products');
      if (!storedProducts) {
        return 1;
      }

      const products = JSON.parse(storedProducts) as Array<{ id: string; quantity?: number }>;
      const product = products.find((item) => item.id === productId);
      return product?.quantity ?? 1;
    } catch {
      return 1;
    }
  };

  const isProductSoldOut = (productId: string) => getProductStock(productId) <= 0;

  const addToCart = (productId: string, quantity = 1) => {
    const stock = getProductStock(productId);
    const currentCart = cartRef.current;
    const existing = currentCart.find((item) => item.productId === productId);
    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (quantity <= 0 || stock <= 0 || newQuantity > stock) {
      return;
    }

    commitCart(existing
      ? currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      : [...currentCart, { productId, quantity }]);
    cartToastId.current += 1;
    setCartToast({
      id: cartToastId.current,
      message: quantity === 1 ? 'Added to cart' : `${quantity} items added to cart`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (isProductSoldOut(productId)) {
      commitCart(cartRef.current.filter((item) => item.productId !== productId));
      return;
    }

    const stock = getProductStock(productId);
    const safeQuantity = Math.min(Math.max(quantity, 0), stock || 1);

    commitCart(
      cartRef.current
        .map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    commitCart(cartRef.current.filter((item) => item.productId !== productId));
  };

  const toggleCartItem = (productId: string) => {
    if (isProductSoldOut(productId)) {
      return;
    }

    const currentCart = cartRef.current;
    const existing = currentCart.find((item) => item.productId === productId);
    commitCart(existing
      ? currentCart.filter((item) => item.productId !== productId)
      : [...currentCart, { productId, quantity: 1 }]);
  };

  const clearCart = () => commitCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const clearWishlist = () => setWishlist([]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        featureFlags,
        searchQuery,
        setSearchQuery,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleCartItem,
        clearCart,
        toggleWishlist,
        clearWishlist,
        setFeatureFlag: updateFlags,
      }}
    >
      {children}
      {cartToast && (
        <div
          key={cartToast.id}
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
          <span>{cartToast.message}</span>
          <button
            type="button"
            onClick={() => setCartToast(null)}
            aria-label="Dismiss notification"
            className="ml-2 rounded p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextValue => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used inside ShopProvider');
  }
  return context;
};
