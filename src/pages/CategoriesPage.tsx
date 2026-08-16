import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import CategoryCard from '../components/CategoryCard';
import { fetchCategories } from '../services/categories';
import type { Category } from '../types';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchCategories(true);
        setCategories(items);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f2]">
      <NavBar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-[#222]">Categories</h1>
            <p className="text-sm text-gray-600">Browse our curated product categories.</p>
          </div>


          {loading ? (
            <Loading message="Loading categories..." />
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-semibold text-black mb-3">No categories available.</p>
              <Link to="/" className="btn btn-primary">Back to shop</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
