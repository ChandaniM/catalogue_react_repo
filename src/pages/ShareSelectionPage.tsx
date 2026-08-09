import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { loadShareSelection, getShareUrl } from '../lib/share';
import type { SharedSelection } from '../lib/share';
import { fetchProductById } from '../lib/products';
import type { Product } from '../types';

const ShareSelectionPage = () => {
  const { token } = useParams<{ token: string }>();
  const [selection, setSelection] = useState<SharedSelection | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSelection = async () => {
      if (!token) return;
      const saved = loadShareSelection(token);
      if (!saved) {
        setLoading(false);
        return;
      }
      setSelection(saved);
      const productMap: Record<string, Product> = {};
      await Promise.all(
        saved.items.map(async (item) => {
          const product = await fetchProductById(item.productId);
          if (product) productMap[item.productId] = product;
        })
      );
      setProducts(productMap);
      setLoading(false);
    };
    loadSelection();
  }, [token]);

  const totalProducts = selection?.items.length || 0;
  const totalPrice = useMemo(
    () => selection?.items.reduce((sum, item) => {
      const product = products[item.productId];
      return sum + (product?.sellingPrice || 0) * item.quantity;
    }, 0) || 0,
    [products, selection]
  );

  const handleCopy = async () => {
    if (!selection) return;
    await navigator.clipboard.writeText(getShareUrl(selection.token));
  };

  const handleNativeShare = async () => {
    if (!selection || !navigator.share) return;
    await navigator.share({
      title: 'Uphar selection',
      text: `I selected ${totalProducts} products. View them here: ${getShareUrl(selection.token)}`,
      url: getShareUrl(selection.token),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center text-black text-lg">Loading selection...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-semibold text-black mb-4">Selection not found</h1>
            <p className="text-gray-500 mb-6">The shared list does not exist or has expired.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">Back to shop</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">Shared selection</h1>
            <p className="text-sm text-gray-600">This is the list shared by a customer.</p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Shared token</p>
                <p className="text-base font-semibold text-black">{selection.token}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleCopy} className="btn btn-secondary">Copy link</button>
                {(typeof navigator.share === 'function') && <button onClick={handleNativeShare} className="btn btn-primary">Share</button>}
                <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Check out this Uphar selection: ${getShareUrl(selection.token)}`)}`} className="btn btn-whatsapp">WhatsApp</a>
              </div>
            </div>

            <div className="grid gap-4">
              {selection.items.map((item) => {
                const product = products[item.productId];
                if (!product) return null;
                return (
                  <div key={`${item.productId}-${item.source}`} className="grid grid-cols-[90px_1fr] gap-4 rounded-3xl border border-gray-200 p-4">
                    <img src={product.image_url} alt={product.name} className="h-24 w-24 rounded-3xl object-cover" />
                    <div className="flex flex-col justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-black">{product.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{item.source === 'cart' ? 'In cart' : 'Wishlist item'}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{product.sellingPrice.toFixed(0)}</p>
                        <p>Total: ₹{(product.sellingPrice * item.quantity).toFixed(0)}</p>
                        <a href={`/product/${product.id}`} className="text-sm text-black underline mt-2 inline-block">View product</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">Total selected products: <span className="font-semibold text-black">{totalProducts}</span></p>
              <p className="text-sm text-gray-500">Estimated total value: <span className="font-semibold text-black">₹{totalPrice.toFixed(0)}</span></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShareSelectionPage;
