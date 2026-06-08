import { Routes, Route } from 'react-router-dom';
import Catalogue from './pages/Catalogue';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Routes>
        <Route path="/" element={<Catalogue />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
