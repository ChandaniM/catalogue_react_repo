import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categories';
import type { Category } from '../types';

const navItems = [
  { label: 'CATEGORIES', key: 'categories' },
  { label: 'NEW ARRIVALS', key: 'newArrivals' },
  { label: 'PRE-ORDERS', key: 'preOrders' },
];

const NavBar: React.FC = () => {
  const { cartCount, searchQuery, setSearchQuery } = useShop();
  const [showSearch, setShowSearch] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const getCategoryColClass = (index: number) => {
    if (index === 0) return 'lg:col-span-6';
    if (index === 1 || index === 2) return 'lg:col-span-3';
    return 'lg:col-span-3';
  };

  const getCategoryHeightClass = (index: number) => {
    if (index === 0) return 'min-h-[360px]';
    return 'min-h-[260px]';
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await fetchCategories(true);
        setCategories(items);
      } catch (error) {
        console.error('Error loading navbar categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleSearchToggle = () => {
    setShowSearch((state) => !state);
    if (showSearch) setSearchQuery('');
  };

  const handleMenuToggle = (menu: string) => {
    setActiveMenu((current) => (current === menu ? null : menu));
    setDrawerSearch('');
  };

  const closeDrawer = () => setActiveMenu(null);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(drawerSearch.toLowerCase()) ||
    category.slug.toLowerCase().includes(drawerSearch.toLowerCase())
  );

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
    closeDrawer();
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <div className="relative w-full bg-white border-b border-gray-200 h-auto py-3">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-[10.625rem]">
            <Link to="/" className="no-underline text-black">
              <div className="text-2xl font-bold tracking-wide">UPHΛRT</div>
              <div className="text-xs tracking-wider">THE GIFT SHOP</div>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-8 ml-6 uppercase text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleMenuToggle(item.key)}
                className="flex items-center gap-1 text-black hover:text-red-600 transition-colors"
              >
                <span>{item.label}</span>
                <ChevronDown size={14} />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-48 bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleSearchToggle}
                  className="text-gray-500 hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSearchToggle}
                className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-all"
              >
                <Search size={18} />
              </button>
            )}
          </div>
          <Link to="/cart" className="relative inline-flex items-center justify-center p-2 rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-all">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-h-[1.25rem] min-w-[1.25rem] rounded-full bg-red-600 px-1.5 text-[0.625rem] font-semibold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {activeMenu && (
        <div className="absolute inset-x-0 top-full z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-gray-500">{activeMenu === 'categories' ? 'Categories' : activeMenu === 'newArrivals' ? 'New arrivals' : 'Pre-orders'}</p>
                <h3 className="text-2xl font-semibold text-black">{activeMenu === 'categories' ? 'Browse all categories' : activeMenu === 'newArrivals' ? 'Discover new arrivals' : 'Reserve pre-orders'}</h3>
              </div>
              <button onClick={closeDrawer} className="self-start text-gray-500 hover:text-black lg:self-center">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-black outline-none focus:border-black"
                />
                {activeMenu !== 'categories' && (
                  <button
                    type="button"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleQuickAction(activeMenu === 'newArrivals' ? '/new-arrivals' : '/pre-orders')}
                    className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                  >
                    View all
                  </button>
                )}
              </div>

              {activeMenu === 'categories' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
                  {filteredCategories.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">No categories found.</div>
                  ) : (
                    filteredCategories.map((category, index) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryClick(category.slug)}
                        className={`group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${getCategoryColClass(index)}`}
                      >
                        <div className={`flex h-full flex-col justify-between ${getCategoryHeightClass(index)}`}>
                          <div className="flex flex-col justify-center gap-3">
                            <p className="text-3xl font-semibold tracking-tight text-black">{category.name}</p>
                            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">{category.slug.replace('-', ' ')}</p>
                          </div>
                          <div className="mt-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                            Browse products by {category.name.toLowerCase()} and explore the latest selections.
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleQuickAction(activeMenu === 'newArrivals' ? '/new-arrivals' : '/pre-orders')}
                    className="rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-black hover:shadow-lg transition"
                  >
                    <p className="text-base font-semibold text-black">View all {activeMenu === 'newArrivals' ? 'New Arrivals' : 'Pre-orders'}</p>
                    <p className="mt-2 text-sm text-gray-500">Browse the current collection in this section.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAction(activeMenu === 'newArrivals' ? '/categories' : '/categories')}
                    className="rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-black hover:shadow-lg transition"
                  >
                    <p className="text-base font-semibold text-black">Browse categories</p>
                    <p className="mt-2 text-sm text-gray-500">Search by category for more options.</p>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
