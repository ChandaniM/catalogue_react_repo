import { ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isProductNewArrival } from '../lib/products';
import type { Product } from '../types';
import ProductStockStatus from './ProductStockStatus';

interface SimpleProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
}

const SimpleProductCard = ({ product, cartQuantity, onAddToCart, onRemoveFromCart }: SimpleProductCardProps) => {
  const imageUrl = product.image_url || '';
  const showNewTag = isProductNewArrival(product, 7);

  return (
    <Link to={`/product/${product.id}`} className="block h-full no-underline">
      <div className="group flex h-full w-full cursor-pointer flex-col border border-gray-200 bg-white">
        <div className="relative h-40 shrink-0 bg-white overflow-hidden sm:h-44">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {showNewTag && <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1">NEW</div>}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <div className="mb-2 min-h-[2.5em] line-clamp-2 text-sm font-medium text-black hover:underline">{product.name}</div>
          <div className="mb-3 text-sm font-semibold text-black">₹{product.sellingPrice.toLocaleString('en-IN')}</div>
          <ProductStockStatus quantity={product.quantity} className="mb-3" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (cartQuantity > 0) onRemoveFromCart(product.id);
              else onAddToCart(product.id);
            }}
            disabled={product.quantity !== undefined && product.quantity <= 0 && cartQuantity === 0}
            className={`mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${cartQuantity > 0 ? 'border-red-700 bg-red-700 text-white hover:border-red-800 hover:bg-red-800' : 'border-gray-200 bg-white text-black hover:border-black hover:bg-black hover:text-white'}`}
          >
            {cartQuantity > 0 ? <Trash2 size={16} /> : <ShoppingCart size={16} />}
            {cartQuantity > 0 ? 'Remove from cart' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default SimpleProductCard;
