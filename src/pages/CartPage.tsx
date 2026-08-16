import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { useShop } from '../context/ShopContext';
import { fetchProducts } from '../lib/products';
import type { Product } from '../types';

const CartPage = () => {
  const { cart, clearCart, removeFromCart, updateCartQuantity } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchProducts();
        setProducts(items);
      } catch (error) {
        console.error('Error loading cart products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCheckout = () => {
    // No payment system — show delivery details form and share options
    setShowDetailsForm(true);
  };

  const buildShareMessage = () => {
    const lines: string[] = [];
    lines.push(`Order request from UPHART`);
    if (customerName) lines.push(`Name: ${customerName}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (address) lines.push(`Address: ${address}`);
    if (city) lines.push(`City: ${city}`);
    if (pincode) lines.push(`Pincode: ${pincode}`);
    lines.push('');
    lines.push('Products:');
    cartItems.forEach((item) => {
      const price = item.product?.sellingPrice ? `₹${item.product.sellingPrice}` : '';
      const productUrl = item.product?.id ? `${window.location.origin}/product/${item.product.id}` : '';
      lines.push(`- ${item.product?.name} x${item.quantity} ${price}`);
      if (productUrl) lines.push(`  Link: ${productUrl}`);
    });
    lines.push('');
    lines.push(`Total: ₹${total.toFixed(0)}`);
    if (note) {
      lines.push('');
      lines.push(`Note: ${note}`);
    }
    lines.push('');
    lines.push('Please contact me to confirm and arrange payment/delivery. Thank you!');

    return lines.join('\n');
  };

  const handleWhatsAppShare = () => {
    const message = buildShareMessage();
    const url = `https://wa.me/7700083352?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = async () => {
    const message = buildShareMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      // open instagram, user can paste into a story/direct message
      window.open('https://www.instagram.com/', '_blank');
    } catch (err) {
      console.error('Copy failed', err);
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  const copyMessage = async () => {
    const message = buildShareMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Loading message="Loading your cart..." />
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
            <h1 className="text-3xl font-semibold text-black">Your Cart</h1>
            <p className="text-sm text-gray-600">Review and update your selected products before checkout.</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">Your cart is empty.</p>
              <Link to="/" className="btn btn-primary">Continue Shopping</Link>
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
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="text-black font-semibold">Free</span></div>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between text-base font-semibold text-black mb-4">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>

                  {!showDetailsForm ? (
                    <>
                      <button onClick={handleCheckout} className="w-full btn btn-primary">Add delivery details & share</button>
                      <button onClick={clearCart} className="w-full btn btn-secondary mt-3">Clear Cart</button>
                    </>
                  ) : (
                    <div className="mt-4 space-y-3 text-sm">
                      <h3 className="text-base font-medium">Delivery details</h3>
                      <input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                      <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                      <input placeholder="Address (house, street)" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                        <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                      </div>
                      <textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />

                      <div className="mt-2">
                        <label className="text-sm font-medium">Message preview</label>
                        <textarea readOnly value={buildShareMessage()} className="w-full rounded-lg border border-gray-200 px-3 py-2 h-36 mt-1 text-sm" />
                      </div>

                      <div className="flex gap-2 flex-col sm:flex-row">
                        <button onClick={handleWhatsAppShare} className="btn btn-primary w-full">Share on WhatsApp</button>
                        <button onClick={handleInstagramShare} className="btn btn-outline w-full">Share to Instagram (copy & open)</button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button onClick={copyMessage} className="text-sm text-gray-600 underline">Copy message</button>
                        {copied && <span className="text-sm text-green-600">Copied to clipboard</span>}
                      </div>

                      <div className="mt-2 flex gap-2">
                        <button onClick={() => setShowDetailsForm(false)} className="w-full btn btn-secondary">Cancel</button>
                      </div>
                    </div>
                  )}
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

export default CartPage;
