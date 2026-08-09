import { Link } from 'react-router-dom';
import SimpleProductCard from './SimpleProductCard';
import type { CartItem } from '../context/ShopContext';

interface FeaturedProductsProps {
  products: any[];
  cartItems: CartItem[];
  onAddToCart: (id: string) => void;
}

const FeaturedProducts = ({ products, cartItems, onAddToCart }: FeaturedProductsProps) => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Featured products</h2>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-gray-700 hover:text-black transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {products.map((p) => {
          const cartEntry = cartItems.find((item) => item.productId === p.id);
          return (
            <SimpleProductCard
              key={p.id}
              product={p}
              cartQuantity={cartEntry?.quantity ?? 0}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;
