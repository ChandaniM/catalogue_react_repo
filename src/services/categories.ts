import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DUMMY_CATEGORIES } from '../data/categories';
import type { Category } from '../types';

const LOCAL_STORAGE_KEY = 'uphar_categories';

export const slugify = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const mapFromDb = (row: Record<string, unknown>): Category => ({
  id: row.id as string,
  name: row.name as string,
  slug: row.slug as string,
  coverImage: (row.cover_image as string) || undefined,
  createdAt: (row.created_at as string) || undefined,
  updatedAt: (row.updated_at as string) || undefined,
});

const getLocalCategories = (): Category[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DUMMY_CATEGORIES));
  return DUMMY_CATEGORIES;
};

const saveLocalCategories = (categories: Category[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
};

export const fetchCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return getLocalCategories();
    }

    return data.map(mapFromDb);
  }

  return getLocalCategories();
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return mapFromDb(data);
  }

  return getLocalCategories().find((c) => c.slug === slug) || null;
};

export const addCategory = async (
  name: string,
  coverImage?: string
): Promise<Category | null> => {
  const slug = slugify(name);

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, cover_image: coverImage })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    return mapFromDb(data);
  }

  const categories = getLocalCategories();
  const newCategory: Category = {
    id: String(Date.now()),
    name,
    slug,
    coverImage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveLocalCategories(categories);
  return newCategory;
};

export const updateCategory = async (
  id: string,
  updates: { name?: string; coverImage?: string }
): Promise<Category | null> => {
  if (isSupabaseConfigured() && supabase) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
      dbUpdates.slug = slugify(updates.name);
    }
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;

    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return null;
    }

    return mapFromDb(data);
  }

  const categories = getLocalCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated: Category = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (updates.name) updated.slug = slugify(updates.name);
  categories[index] = updated;
  saveLocalCategories(categories);
  return updated;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    return true;
  }

  const categories = getLocalCategories().filter((c) => c.id !== id);
  saveLocalCategories(categories);
  return true;
};
