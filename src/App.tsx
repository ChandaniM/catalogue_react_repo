import { Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Catalogue from './pages/Catalogue';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import AddProduct from './pages/AddProduct';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchPage from './pages/SearchPage';
import Contact from './pages/Contact';
import ProductListingPage from './pages/ProductListingPage';
import ShareSelectionPage from './pages/ShareSelectionPage';
import OccasionsPage from './pages/OccasionsPage';
import OccasionDetailPage from './pages/OccasionDetailPage';

function App() {
  return (
    <ShopProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Routes>
          <Route path="/" element={<Catalogue />} />
          <Route path="/shop" element={<ProductListingPage title="Shop" description="Browse the full collection." filter={() => true} />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/new-arrivals" element={<ProductListingPage title="New Arrivals" description="Fresh product drops and top picks." filter={(product) => product.isNewArrival === true || false} />} />
          <Route path="/pre-orders" element={<ProductListingPage title="Pre-orders" description="Reserve the latest products before they arrive." filter={(product) => product.isPreOrder === true} />} />
          <Route path="/deals" element={<ProductListingPage title="Deals" description="Grab the latest offers before they are gone." filter={(product) => product.isDeal === true} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/share/:token" element={<ShareSelectionPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/add-product" element={<AddProduct />} />
         <Route path="/contact" element={<Contact />} />
         <Route path="/occasions" element={<OccasionsPage />} />
         <Route path="/occasions/:key" element={<OccasionDetailPage />} />
        </Routes>
      </div>
    </ShopProvider>
  );
}
 
export default App;
