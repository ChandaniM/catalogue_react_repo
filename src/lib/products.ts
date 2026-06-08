import { supabase, isSupabaseConfigured } from './supabase';
import { DUMMY_PRODUCTS } from '../data/products';
import { DUMMY_CATEGORIES } from '../data/categories';
import type { Product } from '../types';

const LOCAL_STORAGE_KEY = 'uphar_products';
const MIGRATION_KEY = 'uphar_products_migrated_v1';

const mapFromDb = (p: Record<string, unknown>): Product => ({
  id: p.id as string,
  name: p.name as string,
  description: p.description as string,
  image_url: p.image_url as string,
  costPrice: p.cost_price as number,
  sellingPrice: p.selling_price as number,
  quantity: p.quantity as number | undefined,
  tags: (p.tags as string[]) || [],
  categoryId: (p.category_id as string) || '',
});

const migrateLocalProducts = (products: Product[]): Product[] => {
  const defaultCategoryId = DUMMY_CATEGORIES[0]?.id || 'cat-general';
  return products.map((p) => ({
    ...p,
    categoryId: p.categoryId || defaultCategoryId,
  }));
};

const getLocalProducts = (): Product[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  let products: Product[];

  if (stored) {
    products = JSON.parse(stored);
  } else {
    products = DUMMY_PRODUCTS;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }

  if (!localStorage.getItem(MIGRATION_KEY)) {
    const migrated = migrateLocalProducts(products);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated));
    localStorage.setItem(MIGRATION_KEY, 'true');
    return migrated;
  }

  return products;
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return getLocalProducts();
    }

    return data.map(mapFromDb);
  }

  return getLocalProducts();
};

export const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const products = await fetchProducts();
  return products.filter((p) => p.categoryId === categoryId);
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return mapFromDb(data);
  }

  return getLocalProducts().find((p) => p.id === id) || null;
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        cost_price: product.costPrice,
        selling_price: product.sellingPrice,
        quantity: product.quantity,
        tags: product.tags || [],
        category_id: product.categoryId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    return mapFromDb(data);
  }

  const products = getLocalProducts();
  const newProduct: Product = {
    id: String(Date.now()),
    ...product,
  };
  products.unshift(newProduct);
  saveLocalProducts(products);
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> => {
  if (isSupabaseConfigured() && supabase) {
    const supabaseUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.image_url !== undefined) supabaseUpdates.image_url = updates.image_url;
    if (updates.costPrice !== undefined) supabaseUpdates.cost_price = updates.costPrice;
    if (updates.sellingPrice !== undefined) supabaseUpdates.selling_price = updates.sellingPrice;
    if (updates.quantity !== undefined) supabaseUpdates.quantity = updates.quantity;
    if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
    if (updates.categoryId !== undefined) supabaseUpdates.category_id = updates.categoryId;

    const { data, error } = await supabase
      .from('products')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return mapFromDb(data);
  }

  const products = getLocalProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updates };
  saveLocalProducts(products);
  return products[index];
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    return true;
  }

  const products = getLocalProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveLocalProducts(filtered);
  return true;
};

// ============ TAGS ============

const TAGS_STORAGE_KEY = 'uphar_tags';
const DEFAULT_TAGS = ['Birthday', 'Anniversary', 'Self Care', 'Luxury', 'Hampers', 'Personalized'];

const getLocalTags = (): string[] => {
  const stored = localStorage.getItem(TAGS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
  return DEFAULT_TAGS;
};

const saveLocalTags = (tags: string[]) => {
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
};

export const fetchTags = async (): Promise<string[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
      return getLocalTags();
    }

    return data.map((t) => t.name);
  }

  return getLocalTags();
};

export const addTag = async (name: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('tags')
      .insert({ name });

    if (error) {
      console.error('Error adding tag:', error);
      return false;
    }
    return true;
  }

  const tags = getLocalTags();
  if (!tags.includes(name)) {
    tags.push(name);
    saveLocalTags(tags);
  }
  return true;
};

export const deleteTag = async (name: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('name', name);

    if (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
    return true;
  }

  const tags = getLocalTags();
  const filtered = tags.filter((t) => t !== name);
  saveLocalTags(filtered);
  return true;
};
