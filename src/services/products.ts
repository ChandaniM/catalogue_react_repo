import { addProduct, deleteProduct, fetchProducts, updateProduct } from '../lib/products';
import type { Product } from '../types';

export const productApi = {
  async getAll(): Promise<Product[]> {
    return fetchProducts();
  },

  async create(product: Omit<Product, 'id'>): Promise<Product | null> {
    return addProduct(product);
  },

  async update(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> {
    return updateProduct(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    return deleteProduct(id);
  }
};
