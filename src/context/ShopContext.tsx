import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        setCart([]);
      }
    }

    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch {
        setWishlist([]);
      }
    }

    setFeatureFlags(loadFeatureFlags());
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

  const addToCart = (productId: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { productId, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const toggleCartItem = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.filter((item) => item.productId !== productId);
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const clearCart = () => setCart([]);

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
