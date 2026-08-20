import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { fetchProducts } from '../lib/products';
import KeychainProductCard from '../components/KeychainProductCard';

const OccasionDetailPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchProducts();
        setProducts(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!key) return [];
    const k = key.toLowerCase();
    return products.filter((p) => {
      const matchesTag = (p.tags || []).map((t: string) => t.toLowerCase()).includes(k);
      const matchesOccasion = (p.occasion || '').toLowerCase() === k;
      return matchesTag || matchesOccasion;
    });
  }, [products, key]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading message="Loading products..." />
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/occasions" className="text-sm text-gray-600 hover:underline">Back to occasions</Link>
            <h1 className="text-3xl font-serif text-black mt-3 mb-2">{key}</h1>
            <p className="text-sm text-gray-600">Gifts suitable for {key}.</p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No products found for this occasion.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <KeychainProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OccasionDetailPage;
