import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import type { Product } from '../types';
import emptyPage from '../assets/on-product-found.png';
import { fetchProducts as getProducts, fetchTags } from '../lib/products';

const Catalogue = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, tagsData] = await Promise.all([
          getProducts(),
          fetchTags()
        ]);
        setProducts(productsData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by tag first
    if (selectedTag) {
      filtered = filtered.filter(
        (product) => product.tags?.includes(selectedTag)
      );
    }
    
    // Then filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [products, searchTerm, selectedTag]);

  return (
    <>
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
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 md:py-16">
              <img src={emptyPage} alt="No products found" className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain mb-4 sm:mb-6 opacity-80" />
              <p className="text-gray-500 text-sm sm:text-base">No products found.</p>
            </div>
          ) : (
            <>
            <h2 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-[var(--charcoal)] mb-4 sm:mb-5 md:mb-6">
              Featured Gifts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Catalogue;
