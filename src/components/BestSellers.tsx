import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SimpleProductCard from './SimpleProductCard';
import { fetchProducts } from '../lib/products';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState(0);
  const { cart } = useShop();

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchProducts();
        // pick top sellers by soldQuantity if available else first items
        const ordered = [...all].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
        setProducts(ordered.slice(0, 12));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visible = 4; // how many cards visible on desktop

  const prev = () => setPos((p) => Math.max(0, p - 1));
  const next = () => setPos((p) => Math.min(Math.max(0, products.length - visible), p + 1));

  return (
    <section className="max-w-7xl mx-auto px-6 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Best Sellers</p>
          <h2 className="text-xl font-semibold text-black">Our most loved gifts</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prev} aria-label="Previous" className="rounded-full bg-white border border-gray-200 p-2 shadow-sm">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} aria-label="Next" className="rounded-full bg-white border border-gray-200 p-2 shadow-sm">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-50 animate-pulse" />
      ) : (
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-4 transition-transform duration-500" style={{ transform: `translateX(-${pos * (100 / visible)}%)`, width: `${(products.length / visible) * 100}%` }}>
              {products.map((product) => (
                <div key={product.id} style={{ flex: `0 0 ${100 / Math.min(products.length, visible)}%` }} className="min-w-[220px] max-w-[280px]">
                  <SimpleProductCard product={product} cartQuantity={cart.find((c) => c.productId === product.id)?.quantity || 0} onAddToCart={() => { /* intentionally left blank; SimpleProductCard's button will call provided handler */ }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BestSellers;
