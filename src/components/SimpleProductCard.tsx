import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SimpleProductCardProps {
  product: any;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
}

const SimpleProductCard = ({ product, cartQuantity, onAddToCart }: SimpleProductCardProps) => {
  const imageUrl = product.image || product.image_url || '';
  const price = product.sellingPrice || product.price || 0;

  return (
    <Link to={`/product/${product.id}`} className="no-underline">
      <div className="group border border-gray-200 bg-white w-56 cursor-pointer">
        <div className="relative h-44 bg-white overflow-hidden">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1">NEW</div>
        </div>

        <div className="p-3">
          <div className="text-sm font-medium text-black hover:underline">{product.name}</div>
          <div className="text-sm font-semibold mt-1 text-black">₹{price}</div>
          {cartQuantity > 0 && (
            <div className="mt-2 text-xs text-gray-500">In cart: {cartQuantity} item{cartQuantity > 1 ? 's' : ''}</div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition ${cartQuantity > 0 ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-black hover:border-black hover:bg-black hover:text-white'}`}
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
