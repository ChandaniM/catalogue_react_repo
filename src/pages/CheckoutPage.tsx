import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { useShop } from '../context/ShopContext';
import { fetchProductById, fetchProducts } from '../lib/products';
import type { Product } from '../types';

const CheckoutPage = () => {
  const { cart, addToCart, clearCart, updateCartQuantity, removeFromCart } = useShop();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const navigate = useNavigate();
  const productId = searchParams.get('productId');

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchProducts();
        setProducts(items);
        if (productId) {
          const existing = cart.find((item) => item.productId === productId);
          if (!existing) {
            const product = await fetchProductById(productId);
            if (product) addToCart(productId, 1);
          }
        }
      } catch (error) {
        console.error('Error loading checkout products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const cartItems = useMemo(
    () => cart
      .map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
      }))
      .filter((item) => item.product),
    [cart, products]
  );

  const total = cartItems.reduce((sum, item) => sum + (item.product?.sellingPrice || 0) * item.quantity, 0);

  const handlePlaceOrder = () => {
    clearCart();
    setOrderComplete(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Loading message="Preparing checkout..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">Checkout</h1>
            <p className="text-sm text-gray-600">Confirm your purchase and place your order.</p>
          </div>

          {orderComplete ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-2xl font-semibold text-black mb-3">Order placed!</p>
              <p className="text-gray-600 mb-6">Your request has been sent to the store. Thank you for shopping with Uphar.</p>
              <button onClick={() => navigate('/')} className="btn btn-primary">Back to shop</button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">Your cart is empty.</p>
              <button onClick={() => navigate('/')} className="btn btn-primary">Shop Now</button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex gap-4 sm:gap-6">
                      <img src={item.product?.image_url} alt={item.product?.name} className="h-24 w-24 rounded-3xl object-cover" />
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-black">{item.product?.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">₹{item.product?.sellingPrice.toFixed(0)} each</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <label className="text-sm text-gray-500">Qty</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.productId, Math.max(1, Number(e.target.value)))}
                            className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          />
                          <button onClick={() => removeFromCart(item.productId)} className="text-sm text-red-600 hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-black mb-4">Order summary</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  {/* <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toFixed(0)}</span></div> */}
                  {/* <div className="flex justify-between"><span>Shipping</span><span className="text-black font-semibold">Free</span></div> */}
                </div>
                <div className="mt-6 border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between text-base font-semibold text-black mb-4">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                  <button onClick={handlePlaceOrder} className="w-full btn btn-primary">Place order</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
