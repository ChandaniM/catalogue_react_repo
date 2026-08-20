import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-50 py-5 border-b border-gray-200" style={{ background: '#ffffff' }}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl font-semibold text-black">Uphar</h1>
          <span className="text-[0.65rem] text-black/70 uppercase tracking-[0.15em] font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/add-product" className="btn btn-primary">Add Product</Link>
          <Link 
            target="_blank" 
            to="/" 
            className="btn bg-black text-white border-black hover:bg-white hover:text-black gap-2 whitespace-nowrap flex-shrink-0"
          >
            <Store size={18} strokeWidth={2} />
            <span>View Shop</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
