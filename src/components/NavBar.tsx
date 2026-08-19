import { Search, ShoppingBag, ChevronDown,  X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categories';
import type { Category } from '../types';

const navItems = [
  { label: 'SHOP', key: 'shop' },
  { label: 'CATEGORIES', key: 'categories' },
  { label: 'NEW ARRIVALS', key: 'newArrivals' },
  { label: 'PRE-ORDERS', key: 'preOrders' },
];

const NavBar: React.FC = () => {
  const { cartCount, searchQuery, setSearchQuery } = useShop();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

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

  const handleMenuToggle = (menu: string) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  const closeDrawer = () => setActiveMenu(null);

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
    closeDrawer();
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <div className="relative w-full bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <Link to="/" className="no-underline text-black shrink-0">
              <div className="text-[1.9rem] font-black leading-none tracking-[-0.08em]">UPHΛRT</div>
              <div className="text-[0.58rem] tracking-[0.22em] uppercase mt-1">The Gift Shop</div>
            </Link>

            <nav className="hidden lg:flex items-center gap-7 uppercase text-[0.76rem] font-medium tracking-[0.04em] flex-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleMenuToggle(item.key)}
                  className="flex items-center gap-1 text-black transition-colors hover:text-gray-600"
                >
                  <span>{item.label}</span>
                  <ChevronDown size={12} />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-2 w-[340px] rounded-full border border-[#e7e2dc] bg-[#f5f3f1] px-4 py-2.5">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
              />
            </div>

            <button type="button" className="lg:hidden p-2 text-black">
              <Search size={18} />
            </button>

            <Link to="/cart" className="relative inline-flex items-center justify-center p-2 text-black">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-h-[1.1rem] min-w-[1.1rem] rounded-full bg-[#c41f1f] px-1 text-[0.55rem] font-semibold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {activeMenu && (
        <div className="absolute inset-x-0 top-full z-50 bg-white border-t border-[#ece7e1] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-end mb-3">
              <button onClick={closeDrawer} className="text-gray-500 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {activeMenu === 'categories' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-3 text-black">
                {categories.length === 0 ? (
                  <div className="col-span-full text-gray-500 py-4">No categories found.</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryClick(category.slug)}
                      className="text-left py-1.5 text-[0.95rem] font-medium hover:text-[#f06ca4] transition-colors"
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleQuickAction(activeMenu === 'newArrivals' ? '/new-arrivals' : '/pre-orders')}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black hover:border-black"
                >
                  View all {activeMenu === 'newArrivals' ? 'New Arrivals' : 'Pre-orders'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('/categories')}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black hover:border-black"
                >
                  Browse categories
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
