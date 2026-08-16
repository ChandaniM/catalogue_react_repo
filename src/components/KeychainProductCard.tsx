import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface Props {
  product: Product;
}

const KeychainProductCard = ({ product }: Props) => {
  const { addToCart, wishlist, toggleWishlist } = useShop();
  const inWishlist = wishlist.includes(product.id);
  const isSoldOut = (product.quantity ?? 0) <= 0;

  return (
    <div className="bg-white rounded-lg border border-[#efe7df] overflow-hidden">
      <Link to={`/product/${product.id}`} className="no-underline">
        <div className="h-52 md:h-56 lg:h-64 w-full bg-[#faf6f2] flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain transition-transform duration-500 hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link to={`/product/${product.id}`} className="no-underline">
              <h3 className="font-serif text-base text-[#262423] mb-1">{product.name}</h3>
            </Link>
            <div className="text-xs text-gray-500">{(product.tags || []).slice(0,2).join(', ')}</div>
          </div>
          <button onClick={() => toggleWishlist(product.id)} aria-label="Wishlist" className="p-2 rounded-full border border-gray-100 text-gray-600 hover:bg-[#fff7ed] transition">
            <Heart size={16} className={`${inWishlist ? 'text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
           <div className="text-lg font-semibold text-[#1f1f1f]">₹{product.sellingPrice}</div>
           <button
             onClick={() => !isSoldOut && addToCart(product.id)}
             disabled={isSoldOut}
             className="btn btn-primary inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
           >
             <ShoppingCart size={14} /> {isSoldOut ? 'Sold out' : 'Add'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default KeychainProductCard;
