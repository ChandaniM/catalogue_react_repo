import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import Loading from '../components/Loading';
import type { Product, Category } from '../types';
import { fetchProducts, fetchTags } from '../lib/products';
import { fetchCategories } from '../services/categories';

const Catalogue = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, tagsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchTags(),
          fetchCategories(),
        ]);
        setProducts(productsData);
        setTags(tagsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching catalogue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

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
  }, [products, selectedTag, searchTerm]);

  const displayCategories = useMemo(() => {
    const hasFilters = selectedTag || searchTerm.trim();

    return categories
      .map((category) => {
        const count = filteredProducts.filter((p) => p.categoryId === category.id).length;
        const fallbackCover = products.find((p) => p.categoryId === category.id)?.image_url;
        return {
          ...category,
          productCount: count,
          coverImage: category.coverImage || fallbackCover,
        };
      })
      .filter((category) => !hasFilters || category.productCount > 0);
  }, [categories, filteredProducts, products, selectedTag, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            tags={tags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />

          {loading ? (
            <Loading />
          ) : displayCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 md:py-16">
              <p className="text-4xl mb-4 opacity-60">📁</p>
              <p className="text-gray-500 text-sm sm:text-base">
                {categories.length === 0
                  ? 'No categories available yet.'
                  : 'No matching categories found.'}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-[var(--charcoal)] mb-4 sm:mb-5">
                Browse Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {displayCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    productCount={category.productCount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
