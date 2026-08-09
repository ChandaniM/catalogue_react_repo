import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import ShippingBar from '../components/ShippingBar';
import NavBar from '../components/NavBar';
import CategorySection from '../components/CategorySection';
import SelectedProductsSection from '../components/SelectedProductsSection';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';
import { fetchProducts } from '../lib/products';

const Catalogue = () => {
  const { cart, wishlist } = useShop();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching catalogue data:', error);
      }
    };

    loadData();
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ShippingBar />
      <NavBar />
      <main className="flex-1">
        <CategorySection />
        <SelectedProductsSection products={products} cartItems={cart} wishlist={wishlist} />
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
