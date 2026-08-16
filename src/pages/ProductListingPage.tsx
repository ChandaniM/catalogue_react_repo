import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { fetchProducts } from '../lib/products';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';

interface ProductListingPageProps {
  title: string;
  description?: string;
  filter: (product: Product, query?: string) => boolean;
  hideIfDisabled?: boolean;
  disabledMessage?: string;
}

const ProductListingPage = ({ title, description, filter, hideIfDisabled = false, disabledMessage }: ProductListingPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useShop();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const items = await fetchProducts();
        setProducts(items);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => products.filter((product) => filter(product, searchQuery)),
    [products, filter, searchQuery]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf7f2]">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Loading message="Loading products..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hideIfDisabled && disabledMessage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf7f2]">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 text-center py-16">
            <p className="text-2xl font-semibold text-black mb-4">{title}</p>
            <p className="text-gray-500">{disabledMessage}</p>
            <Link to="/" className="btn btn-primary mt-6 inline-flex">Return to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f2]">
      <NavBar />
      <main className="flex-1 py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#222] mb-2">{title}</h1>
            {description && <p className="text-sm sm:text-base text-gray-600 max-w-3xl">{description}</p>}
          </div>


          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl text-black font-semibold mb-3">No products found</p>
              <p className="text-sm text-gray-500">Try another search or browse our full collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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

export default ProductListingPage;
