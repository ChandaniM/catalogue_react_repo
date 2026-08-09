import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { useShop } from '../context/ShopContext';
import { fetchProducts } from '../lib/products';
import type { Product } from '../types';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchProducts();
        setProducts(items);
      } catch (error) {
        console.error('Error loading wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const wishlistItems = useMemo(
    () => wishlist
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[],
    [wishlist, products]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Loading message="Loading wishlist..." />
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
            <h1 className="text-3xl font-semibold text-black">Your Wishlist</h1>
            <p className="text-sm text-gray-600">Products you've saved for later.</p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">Your wishlist is empty.</p>
              <Link to="/" className="btn btn-primary">Browse products</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((product) => (
                <div key={product.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <img src={product.image_url} alt={product.name} className="h-52 w-full rounded-3xl object-cover" />
                  <div className="mt-4">
                    <h2 className="text-base font-semibold text-black">{product.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">₹{product.sellingPrice.toFixed(0)}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => addToCart(product.id)} className="btn btn-primary">Add to cart</button>
                      <button onClick={() => toggleWishlist(product.id)} className="btn btn-secondary">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
