import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { productMatchesSearch } from '../lib/products';
import { fetchCategories } from '../services/categories';
import { fetchOccasions } from '../services/occasions';
import type { Category, Occasion, Product } from '../types';

interface ProductDiscoveryProps {
  products: Product[];
  query?: string;
  filter?: (product: Product, query?: string) => boolean;
}

const ProductDiscovery = ({ products, query = '', filter = () => true }: ProductDiscoveryProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [occasionKey, setOccasionKey] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'sold-out'>('all');
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  useEffect(() => {
    const loadOptions = async () => {
      const [categoryItems, occasionItems] = await Promise.all([
        fetchCategories(true).catch((error: unknown) => {
          console.error('Error fetching product filter categories:', error);
          return [];
        }),
        fetchOccasions().catch((error: unknown) => {
          console.error('Error fetching product filter occasions:', error);
          return [];
        }),
      ]);
      setCategories(categoryItems);
      setOccasions(occasionItems);
    };

    void loadOptions();
  }, []);

  const occasionOptions = useMemo(() => {
    const productOccasions = [...new Set(products.map((product) => product.occasion).filter((value): value is string => Boolean(value)))];
    return productOccasions.map((value) => ({
      key: value,
      label: occasions.find((occasion) => occasion.key.toLowerCase() === value.toLowerCase())?.label
        ?? occasions.find((occasion) => occasion.label.toLowerCase() === value.toLowerCase())?.label
        ?? value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    }));
  }, [products, occasions]);

  const filtered = useMemo(() => {
    const minimum = minPrice === '' ? undefined : Number(minPrice);
    const maximum = maxPrice === '' ? undefined : Number(maxPrice);
    const matchingProducts = products.filter((product) => {
      const quantity = product.quantity;
      return filter(product, query)
        && productMatchesSearch(product, query)
        && (!categoryId || product.categoryId === categoryId)
        && (!occasionKey || product.occasion?.toLowerCase() === occasionKey.toLowerCase())
        && (minimum === undefined || product.sellingPrice >= minimum)
        && (maximum === undefined || product.sellingPrice <= maximum)
        && (availability === 'all'
          || (availability === 'in-stock' && (quantity === undefined || quantity > 0))
          || (availability === 'sold-out' && quantity !== undefined && quantity <= 0));
    });

    if (sort === 'price-asc') matchingProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
    if (sort === 'price-desc') matchingProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
    if (sort === 'name') matchingProducts.sort((a, b) => a.name.localeCompare(b.name));
    return matchingProducts;
  }, [products, filter, query, categoryId, occasionKey, minPrice, maxPrice, availability, sort]);

  const clearFilters = () => {
    setCategoryId('');
    setOccasionKey('');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSort('featured');
  };

  return (
    <>
      <section aria-label="Product filters" className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Category
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Occasion
            <select value={occasionKey} onChange={(event) => setOccasionKey(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5">
              <option value="">All occasions</option>
              {occasionOptions.map((occasion) => <option key={occasion.key} value={occasion.key}>{occasion.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Availability
            <select value={availability} onChange={(event) => setAvailability(event.target.value as typeof availability)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5">
              <option value="all">All products</option>
              <option value="in-stock">In stock</option>
              <option value="sold-out">Sold out</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <fieldset className="grid gap-1.5">
            <legend className="mb-1 text-sm font-medium text-gray-700">Price range (₹)</legend>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="minimum-price">Minimum price</label>
              <input id="minimum-price" type="number" min="0" inputMode="numeric" placeholder="Min" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="w-28 rounded-lg border border-gray-300 px-3 py-2.5" />
              <label className="sr-only" htmlFor="maximum-price">Maximum price</label>
              <input id="maximum-price" type="number" min="0" inputMode="numeric" placeholder="Max" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="w-28 rounded-lg border border-gray-300 px-3 py-2.5" />
            </div>
          </fieldset>
          <p className="text-sm text-gray-500 sm:ml-auto" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p>
          <button type="button" onClick={clearFilters} className="self-start text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-black sm:self-auto">Clear filters</button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-xl text-black font-semibold mb-3">No products found</p>
          <p className="text-sm text-gray-500">Try changing your search or filters to see more products.</p>
          <button type="button" onClick={clearFilters} className="btn btn-primary mt-5">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </>
  );
};

export default ProductDiscovery;
