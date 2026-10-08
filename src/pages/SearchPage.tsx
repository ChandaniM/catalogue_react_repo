import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ProductDiscovery from '../components/ProductDiscovery';
import Loading from '../components/Loading';
import { fetchProducts } from '../lib/products';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';
import usePageMetadata from '../hooks/usePageMetadata';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useShop();
  const query = searchParams.get('q') ?? searchQuery;
  usePageMetadata(
    query.trim() ? `Search results for ${query.trim()} | Uphar The Gift Shop` : 'Search Gifts | Uphar The Gift Shop',
    query.trim()
      ? `Search gift products for ${query.trim()} at Uphar The Gift Shop.`
      : 'Search thoughtfully curated gifts at Uphar The Gift Shop.'
  );

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search', { replace: true });
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
          ) : (
            <ProductDiscovery products={products} query={query} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
