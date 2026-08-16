import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { useShop } from '../context/ShopContext';
import type { Product, Category } from '../types';
import { fetchProducts } from '../lib/products';
import { fetchCategoryBySlug } from '../services/categories';
import { ChevronLeft } from 'lucide-react';
import KeychainProductCard from '../components/KeychainProductCard';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const { searchQuery, setSearchQuery } = useShop();

  // Keychain-specific UI state
  const [activeFilter, setActiveFilter] = useState<'All' | 'Acrylic' | 'Anime' | 'Custom' | 'Metal'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'featured'>('popular');

  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const categoryData = await fetchCategoryBySlug(slug);
        setCategory(categoryData);

        if (categoryData) {
          const productsData = await fetchProducts();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error loading category page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const categoryProducts = useMemo(() => {
    if (!category) return [];
    return products.filter((p) => p.categoryId === category.id);
  }, [products, category]);

  // keychain filters & visible products
  const keychainFiltered = useMemo(() => {
    if (!category || category.slug !== 'keychain') return categoryProducts;

    let items = [...categoryProducts];

    if (activeFilter !== 'All') {
      const f = activeFilter.toLowerCase();
      items = items.filter((p) => (p.tags || []).map((t) => t.toLowerCase()).includes(f));
    }

    if (selectedTag) {
      items = items.filter((p) => p.tags?.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }

    if (sortBy === 'price-asc') items = items.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    if (sortBy === 'price-desc') items = items.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    // featured/popular keep default order

    return items;
  }, [categoryProducts, activeFilter, selectedTag, searchQuery, sortBy, category]);

  const tagChips = useMemo(() => {
    const tags = new Set<string>();
    categoryProducts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags)
      .sort()
      .map((tag) => ({ key: tag, label: tag }));
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts;

    if (selectedTag) {
      filtered = filtered.filter((p) => p.tags?.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [categoryProducts, selectedTag, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
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

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 text-center py-16">
            <p className="text-4xl mb-4">📁</p>
            <p className="text-gray-500 mb-6">Category not found</p>
            <Link to="/" className="btn btn-primary">
              Back to Categories
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isKeychain = category.slug === 'keychain';

  return (
    <div className={`min-h-screen flex flex-col ${isKeychain ? 'bg-[#fbf7f2]' : 'bg-white'}`}>
      <NavBar />
      <main className="flex-1 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <nav className="text-sm text-gray-600 mb-3">
                <Link to="/" className="hover:underline">Home</Link>
                <span className="px-2">/</span>
                <Link to="/categories" className="hover:underline">Categories</Link>
                <span className="px-2">/</span>
                <span className="text-gray-800 font-medium">{category.name}</span>
              </nav>

              <h1 className="font-serif text-3xl md:text-4xl text-[#222] mb-2">{category.name}</h1>
              <p className="text-gray-600 max-w-2xl">Discover unique keychains designed to add personality to your everyday essentials.</p>
              <div className="text-sm text-gray-500 mt-3">{categoryProducts.length} Products</div>
            </div>

            {isKeychain && (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e0d8] bg-[#fffdfb] px-3 py-2">
                  <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-sm outline-none">
                    <option value="popular">Popular</option>
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {isKeychain ? (
            <>
              {categoryProducts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <p className="text-6xl mb-6 opacity-60">🎁</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products in this category yet.</h3>
                  <p className="text-gray-500 mb-6">We're updating this collection. Meanwhile, explore other categories or contact us for requests.</p>
                  <div className="flex gap-3">
                    <Link to="/categories" className="btn btn-outline">View all categories</Link>
                    <Link to="/" className="btn btn-primary">Continue shopping</Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex gap-3 flex-wrap items-center">
                      {(['All', 'Acrylic', 'Anime', 'Custom', 'Metal'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeFilter === f ? 'bg-[#bfa884] text-white' : 'bg-white border border-[#efe7df] text-gray-700'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {keychainFiltered.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-lg text-gray-700 mb-2">No matching products found for your filters.</p>
                      <button onClick={() => setActiveFilter('All')} className="text-sm text-gray-600 underline">Clear filters</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {keychainFiltered.map((product) => (
                        <KeychainProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {categoryProducts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <p className="text-6xl mb-6 opacity-60">🎁</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products in this category yet.</h3>
                  <p className="text-gray-500 mb-6">We're updating this collection. Meanwhile, explore other categories or contact us for requests.</p>
                  <div className="flex gap-3">
                    <Link to="/categories" className="btn btn-outline">View all categories</Link>
                    <Link to="/" className="btn btn-primary">Continue shopping</Link>
                  </div>
                </div>
              ) : (
                <>
{filteredProducts.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-lg text-gray-700 mb-2">No matching products found for your filters.</p>
                      <button onClick={() => setSelectedTag('')} className="text-sm text-gray-600 underline">Clear filters</button>
                    </div>
                  ) : (
                    <>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
