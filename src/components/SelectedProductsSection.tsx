import { MessageCircle } from "lucide-react";
import type { Product } from "../types";
import type { CartItem } from "../context/ShopContext";
import { createShareToken, getShareUrl } from "../lib/share";

interface SelectedProductsSectionProps {
  products: Product[];
  cartItems: CartItem[];
  wishlist: string[];
}

const SelectedProductsSection = ({
  products,
  cartItems,
  wishlist,
}: SelectedProductsSectionProps) => {
  const cartProducts = cartItems
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product);

  const wishlistProducts = products.filter((product) =>
    wishlist.includes(product.id),
  );
  const selectedProducts = [
    ...cartProducts.map((item) => ({
      product: item.product!,
      quantity: item.quantity,
      source: "cart" as const,
    })),
    ...wishlistProducts.map((product) => ({
      product,
      quantity: 1,
      source: "wishlist" as const,
    })),
  ];

  const shareToken = createShareToken(
    selectedProducts.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      source: item.source,
    })),
  );

  const shareLink = getShareUrl(shareToken);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`I selected these Uphar items:%0A${selectedProducts.map((item) => `• ${item.product.name} x${item.quantity}`).join("%0A")}%0A%0AView details: ${shareLink}`)}`;

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <section className='max-w-7xl mx-auto px-6 mt-10 pb-10'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4'>
        <div>
          <h2 className='text-xl font-semibold text-black'>Your saved picks</h2>
          <p className='text-sm text-gray-600'>
            Review products you added to cart or wishlist and share them in one
            click.
          </p>
        </div>
        <a
          href={whatsappUrl}
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-2 rounded-sm border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black'
        >
          <MessageCircle size={16} />
          Share selected items
        </a>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {cartProducts.length > 0 && (
          <div className='rounded-sm border border-gray-200 bg-gray-50 p-5'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3'>
              Cart
            </h3>
            <ul className='space-y-3'>
              {cartProducts.map((item) => (
                <li key={item.product?.id} className='text-sm text-black'>
                  {item.product?.name} x{item.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {wishlistProducts.length > 0 && (
          <div className='rounded-sm border border-gray-200 bg-gray-50 p-5'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3'>
              Wishlist
            </h3>
            <ul className='space-y-3'>
              {wishlistProducts.map((product) => (
                <li key={product.id} className='text-sm text-black'>
                  {product.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='rounded-sm border border-gray-200 bg-white p-5'>
          <h3 className='text-sm font-semibold uppercase tracking-[0.25em] text-gray-700 mb-3'>
            All selected
          </h3>
          <ul className='space-y-2'>
            {selectedProducts.map((item) => (
              <li
                key={`${item.product.id}-${item.source}`}
                className='flex items-center justify-between text-sm text-black'
              >
                <span>
                  {item.product.name}{" "}
                  {item.source === "cart" ? `x${item.quantity}` : ""}
                </span>
                <span className='font-semibold'>
                  ₹{item.product.sellingPrice * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SelectedProductsSection;
