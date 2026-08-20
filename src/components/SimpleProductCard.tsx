import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isProductNewArrival } from '../lib/products';

interface SimpleProductCardProps {
  product: any;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
}

const SimpleProductCard = ({ product, cartQuantity, onAddToCart }: SimpleProductCardProps) => {
  const imageUrl = product.image || product.image_url || '';
  const showNewTag = isProductNewArrival(product, 7);

  return (
    <Link to={`/product/${product.id}`} className="block h-full no-underline">
      <div className="group flex h-full w-full cursor-pointer flex-col border border-gray-200 bg-white">
        <div className="relative h-40 shrink-0 bg-white overflow-hidden sm:h-44">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {showNewTag && <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1">NEW</div>}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <div className="text-sm font-medium text-black hover:underline mb-2">{product.name}</div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product.id); }}
            className={`mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition ${cartQuantity > 0 ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-black hover:border-black hover:bg-black hover:text-white'}`}
          >
            <ShoppingCart size={16} />
            {cartQuantity > 0 ? 'Add one more' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default SimpleProductCard;
