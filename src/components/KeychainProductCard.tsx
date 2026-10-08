import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import ProductStockStatus from './ProductStockStatus';

interface Props {
  product: Product;
}

const KeychainProductCard = ({ product }: Props) => {
  const { addToCart, cart, removeFromCart, wishlist, toggleWishlist } = useShop();
  const cartQuantity = cart.find((item) => item.productId === product.id)?.quantity ?? 0;
  const inWishlist = wishlist.includes(product.id);
  const isSoldOut = product.quantity !== undefined && product.quantity <= 0;

  return (
    <div className="flex h-full flex-col bg-white rounded-lg border border-[#efe7df] overflow-hidden">
      <Link to={`/product/${product.id}`} className="no-underline">
        <div className="relative h-52 md:h-56 lg:h-64 w-full bg-[#faf6f2] flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain transition-transform duration-500 hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${product.id}`} className="no-underline">
              <h3 className="mb-1 min-h-[3rem] line-clamp-2 font-serif text-base text-[#262423]">{product.name}</h3>
            </Link>
            <div className="line-clamp-1 min-h-[1rem] text-xs text-gray-500">{(product.tags || []).slice(0,2).join(', ')}</div>
          </div>
          <button onClick={() => toggleWishlist(product.id)} aria-label="Wishlist" className="shrink-0 p-2 rounded-full border border-gray-100 text-gray-600 hover:bg-[#fff7ed] transition">
            <Heart size={16} className={`${inWishlist ? 'text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
           <div>
             <div className="text-lg font-semibold text-[#1f1f1f]">₹{product.sellingPrice}</div>
             <ProductStockStatus quantity={product.quantity} className="mt-2" />
           </div>
           <button
             onClick={() => cartQuantity > 0 ? removeFromCart(product.id) : addToCart(product.id)}
             disabled={isSoldOut && cartQuantity === 0}
             className={`btn inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${cartQuantity > 0 ? 'bg-red-700 text-white hover:bg-red-800' : 'btn-primary'}`}
           >
             {cartQuantity > 0 ? <Trash2 size={14} /> : <ShoppingCart size={14} />}
             {cartQuantity > 0 ? 'Remove from cart' : isSoldOut ? 'Sold out' : 'Add to cart'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default KeychainProductCard;
