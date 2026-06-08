import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import type { Product, Category } from '../types';
import { fetchProducts } from '../lib/products';
import { fetchCategoryBySlug } from '../services/categories';
import { ChevronLeft } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

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

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [categoryProducts, selectedTag, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
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
        <Header />
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 font-medium transition-all mb-6 no-underline"
          >
            <ChevronLeft size={16} /> Back to Categories
          </Link>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            chips={tagChips}
            selectedChip={selectedTag}
            onChipSelect={setSelectedTag}
            allLabel="All"
            mobileTitle="Filter by Tag"
            showChips={tagChips.length > 0}
          />

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-4xl mb-4 opacity-60">🎁</p>
              <p className="text-gray-500 text-sm sm:text-base">
                {categoryProducts.length === 0
                  ? 'No products in this category yet.'
                  : 'No matching products found.'}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredProducts.map((product) => (
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

export default CategoryPage;
