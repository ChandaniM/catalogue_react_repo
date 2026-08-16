import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import CategoryCard from './CategoryCard';
import { fetchCategories } from '../services/categories';
import type { Category } from '../types';

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await fetchCategories(true);
        setCategories(items);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Browse by category</p>
          <h2 className="text-xl font-semibold text-black">Shop by category</h2>
        </div>
        <a href="/categories" className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-gray-700">
          View all <ArrowRight size={16} />
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-3xl border border-gray-200 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
