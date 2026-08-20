import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useShop();
  const isSoldOut = (product.quantity ?? 0) <= 0;

  return (
    <div className="product-card block bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 border-2 border-transparent">
      <Link to={`/product/${product.id}`} className="no-underline">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 md:hover:scale-110"
          />
          {/* Safe Check for optional item quantities prevents error TS18048 */}
          {product.quantity !== undefined && product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase py-1 px-2.5 rounded-md">
                Sold Out
              </span>
            </div>
          )}
          
        </div>
      </Link>

      <div className="p-2.5 sm:p-4 md:p-5 lg:p-6 pb-3 sm:pb-5 md:pb-6 bg-gradient-to-b from-white to-[var(--primary-light)]/30">
        <h3 className="font-display text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-[var(--charcoal)] mb-0.5 sm:mb-1 md:mb-2 leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => !isSoldOut && addToCart(product.id)}
            disabled={isSoldOut}
            className="btn flex-1 btn-primary inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={14} /> {isSoldOut ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;