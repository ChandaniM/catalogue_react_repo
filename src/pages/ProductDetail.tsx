import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = product
    ? encodeURIComponent(
        `Hi! I'm interested in "${product.name}" from Uphar The Gift Shop. Can you please share more details?\n\nProduct Link: ${window.location.href}`
      )
    : '';
  const isSoldOut = (product?.quantity ?? 1) <= 0;

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
      <main className="flex-1 bg-[#f9f7f4] py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            {category ? (
              <Link to={`/category/${category.slug}`} className="hover:text-black transition-colors">{category.name}</Link>
            ) : (
              <span>Product</span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-10 xl:gap-12 items-start">
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-[540px] overflow-hidden rounded-[22px] bg-[#f4f0eb]">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full aspect-[4/4.3] lg:aspect-[1/1.1] object-cover"
                />
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 md:p-7">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {product.isNewArrival && (
                  <span className="inline-flex items-center rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white uppercase">
                    New
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center rounded-full border border-[#e8e0d8] bg-[#f9f7f4] px-2.5 py-1 text-[10px] font-medium tracking-[0.15em] text-gray-700 uppercase">
                    {category.name}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-[2.7rem] font-semibold text-black leading-none tracking-[-0.04em] text-balance">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-3xl sm:text-4xl font-semibold text-black">₹{product.sellingPrice}</span>
                {product.costPrice > 0 && product.costPrice !== product.sellingPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{product.costPrice}</span>
                )}
              </div>

              <div className="mt-6 space-y-4 text-sm sm:text-base text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>{(product.quantity ?? 0) > 0 ? 'In stock and ready to ship' : 'Currently unavailable'}</span>
                </div>
                <p className="leading-relaxed text-gray-600">{product.description}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => !isSoldOut && addToCart(product.id)}
                  disabled={isSoldOut}
                  className="btn btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSoldOut ? 'Sold out' : 'Add to cart'}
                </button>
                <a
                  href={`https://wa.me/7700083352?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp flex-1 justify-center"
                >
                  <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                </a>
              </div>

              <button onClick={copyLink} className="btn btn-secondary mt-3 w-full justify-center">
                <span className="text-base">{copied ? '✓' : '⧉'}</span>
                {copied ? 'Copied link' : 'Copy product link'}
              </button>

              <div className="mt-8 rounded-2xl bg-[#faf7f3] p-4 sm:p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Product details</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-4 border-b border-[#efe7df] pb-3">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium text-black">{category?.name || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-[#efe7df] pb-3">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium text-black">{(product.quantity ?? 0) > 0 ? 'Available' : 'Sold out'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Tags</span>
                    <span className="font-medium text-black">{product.tags?.length ? product.tags.join(', ') : 'Curated pick'}</span>
                  </div>
                </div>
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
