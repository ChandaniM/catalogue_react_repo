import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import type { Product, Category } from '../types';
import { fetchProductById } from '../lib/products';
import { fetchCategories } from '../services/categories';
import { useShop } from '../context/ShopContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useShop();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchProductById(id);
        setProduct(data);

        if (data?.categoryId) {
          const categories = await fetchCategories();
          setCategory(categories.find((c) => c.id === data.categoryId) || null);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = product
    ? encodeURIComponent(
        `Hi! I'm interested in "${product.name}" from Uphar The Gift Shop. Can you please share more details?\n\nProduct Link: ${window.location.href}`
      )
    : '';

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="flex-1 py-6 sm:py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <Loading message="Loading product..." />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <NavBar />
        <main className="flex-1 py-6 sm:py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center py-10 sm:py-16 md:py-20">
            <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎁</p>
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Product not found</p>
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-arrow-left" /> Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-start">
            <div className="md:sticky md:top-24">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl"
              />
            </div>

            <div className="py-2 sm:py-3 md:py-5">
              <nav className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6 flex-wrap">
                <Link
                  to="/"
                  className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors no-underline"
                >
                  Categories
                </Link>
                {category && (
                  <>
                    <span className="text-gray-300">/</span>
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors no-underline"
                    >
                      {category.name}
                    </Link>
                  </>
                )}
              </nav>

              <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[var(--charcoal)] mb-3 sm:mb-4 md:mb-5 leading-tight">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 leading-relaxed mb-5 sm:mb-6 md:mb-8">
                {product.description}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={() => addToCart(product.id)}
                  className="btn btn-primary justify-center"
                >
                  <i className="fas fa-shopping-cart" /> Add to cart
                </button>
                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp justify-center"
                >
                  <i className="fab fa-whatsapp" /> Enquire on WhatsApp
                </a>
                <button onClick={copyLink} className="btn btn-secondary justify-center">
                  <i className={`fas fa-${copied ? 'check' : 'link'}`} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
