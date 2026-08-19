import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import type { Product, Category } from '../types';
import { fetchProductById } from '../lib/products';
import { fetchCategories } from '../services/categories';
import { useShop } from '../context/ShopContext';

// Icons
import { FaWhatsapp, FaInstagram, FaShieldAlt, FaLeaf, FaStar, FaGift, FaShoppingCart } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

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

  const { addToCart } = useShop();

  const getCartSummaryText = (): string => {
    try {
      const storedProducts = localStorage.getItem('uphar_products');
      const storedCart = localStorage.getItem('uphar_cart');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      const cartItems = storedCart ? JSON.parse(storedCart) : [];

      if (!cartItems || cartItems.length === 0) {
        return `${product?.name || ''} - ${window.location.href}`;
      }

      const lines = cartItems.map((item: any) => {
        const p = products.find((x: any) => x.id === item.productId);
        return `${p?.name || item.productId} x${item.quantity}`;
      });

      return `My cart from Uphar:\n${lines.join('\n')}\n\nView cart: ${window.location.origin}/cart`;
    } catch (err) {
      return `${product?.name || ''} - ${window.location.href}`;
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(getCartSummaryText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareInstagram = async () => {
    const url = window.location.href;
    const text = `${product?.name || ''} \n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, text, url });
      } catch (err) {
        // ignore
      }
      return;
    }

    // fallback: copy to clipboard and open instagram homepage
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n\n(Shared from Uphar)`);
      alert('Link copied to clipboard. Paste it in Instagram to share.');
      window.open('https://www.instagram.com/', '_blank');
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  // remove copied state unused



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
              <div className="w-full max-w-[540px] overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full max-h-[560px] object-contain"
                />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {category && (
                  <span className="inline-flex items-center rounded-full border border-[#f1e9e2] bg-[#fff6f2] px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-[#d9735b] uppercase">
                    {category.name}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-[2.25rem] font-extrabold text-black leading-tight">
                {product.name}
              </h1>

              <p className="mt-4 text-gray-600 max-w-xl">{product.description}</p>

              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-gray-700">{(product.quantity ?? 0) > 0 ? 'In stock' : 'Out of stock'}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-[22px] text-[#9b6b4f]" />
                    <div>
                      <div className="text-sm font-semibold">Premium Quality</div>
                      <div className="text-xs text-gray-500">Handpicked materials</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaLeaf className="text-[20px] text-[#60a86b]" />
                    <div>
                      <div className="text-sm font-semibold">Non-Toxic Material</div>
                      <div className="text-xs text-gray-500">Safe for kids</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaStar className="text-[20px] text-[#f5c84a]" />
                    <div>
                      <div className="text-sm font-semibold">Finely Detailed</div>
                      <div className="text-xs text-gray-500">Precise finishing</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaGift className="text-[20px] text-[#d9735b]" />
                    <div>
                      <div className="text-sm font-semibold">Perfect for Gifting</div>
                      <div className="text-xs text-gray-500">Ready to wrap</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid sm:flex-row sm:items-center gap-4">
                <div className="grid gap-3 w-full sm:w-auto grid-cols-2">
                  <button onClick={() => shareWhatsApp()} className="btn btn-whatsapp btn-lg inline-flex items-center gap-3 w-full sm:w-auto justify-center">
                    <FaWhatsapp className="text-lg" />
                    <span className="text-sm">WhatsApp</span>
                  </button>

                  <button onClick={() => shareInstagram()} className="btn btn-secondary btn-lg inline-flex items-center gap-3 w-full sm:w-auto justify-center">
                    <FaInstagram className="text-lg" />
                    <span className="text-sm">Instagram</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(product.id)}
                  className="btn btn-primary btn-lg w-full sm:w-auto inline-flex items-center gap-3 justify-center"
                >
                  <FaShoppingCart className="text-lg" />
                  <span className="text-sm">Add to cart</span>
                </button>

              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#fff6f2] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-icon lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
                  <div>
                    <div className="text-sm font-semibold">Secure Packaging</div>
                    <div className="text-xs text-gray-500">Safe & damage-proof</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg></div>
                  <div>
                    <div className="text-sm font-semibold">Authentic Product</div>
                    <div className="text-xs text-gray-500">100% Original</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck-icon lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Pan India Delivery</div>
                    <div className="text-xs text-gray-500">Across 10000+ pin codes</div>
                  </div>
                </div>

              </div>

              {/* <div className="mt-8 rounded-2xl bg-[#faf7f3] p-4 sm:p-5">
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
              </div> */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
