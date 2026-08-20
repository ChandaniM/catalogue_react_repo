import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { fetchProducts } from '../lib/products';
import type { Product } from '../types';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchProducts();
        setProducts(items);
      } catch (error) {
        console.error('Error loading search products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [products, query]);

  const handleSearchChange = (value: string) => {
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Loading message="Searching products..." />
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
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-black">Search</h1>
            <p className="text-sm text-gray-600">Find products across the store.</p>
          </div>

          <div className="max-w-4xl">
            <SearchBar value={query} onChange={handleSearchChange} showChips={false} />
          </div>

          {query.trim().length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">Start typing to search products.</p>
              <p className="text-sm text-gray-500">Search by product name, description, or tag.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">No products found.</p>
              <p className="text-sm text-gray-500">Try another keyword or browse the full collection.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
