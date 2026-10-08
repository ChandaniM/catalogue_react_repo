import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductDiscovery from '../components/ProductDiscovery';
import Loading from '../components/Loading';
import { fetchProducts } from '../lib/products';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';
import usePageMetadata from '../hooks/usePageMetadata';

interface ProductListingPageProps {
  title: string;
  description?: string;
  filter: (product: Product, query?: string) => boolean;
  hideIfDisabled?: boolean;
  disabledMessage?: string;
}

const ProductListingPage = ({ title, description, filter, hideIfDisabled = false, disabledMessage }: ProductListingPageProps) => {
  usePageMetadata(
    `${title} | Uphar The Gift Shop`,
    description || `Shop ${title.toLowerCase()} at Uphar The Gift Shop. Explore thoughtfully curated gifts for every occasion.`
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useShop();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setProducts(await fetchProducts());
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

          <ProductDiscovery products={products} query={searchQuery} filter={filter} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductListingPage;
