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
  isActive: row.is_active !== false,
  createdAt: (row.created_at as string) || undefined,
  updatedAt: (row.updated_at as string) || undefined,
});

const getLocalCategories = (): Category[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    const parsed: Category[] = JSON.parse(stored);
    return parsed.map((c) => ({ ...c, isActive: c.isActive !== false }));
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DUMMY_CATEGORIES));
  return DUMMY_CATEGORIES;
};

const saveLocalCategories = (categories: Category[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
};

export const fetchCategories = async (activeOnly = false): Promise<Category[]> => {
  let categories: Category[];

  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('categories').select('*').order('name', { ascending: true });
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching categories:', error);
      categories = getLocalCategories();
    } else {
      categories = data.map(mapFromDb);
    }
  } else {
    categories = getLocalCategories();
  }

  return activeOnly ? categories.filter((c) => c.isActive) : categories;
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

export const addCategory = async (input: {
  name: string;
  slug?: string;
  coverImage?: string;
  isActive?: boolean;
}): Promise<Category | null> => {
  const slug = input.slug?.trim() || slugify(input.name);
  const isActive = input.isActive !== false;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: input.name, slug, cover_image: input.coverImage, is_active: isActive })
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
    name: input.name,
    slug,
    coverImage: input.coverImage,
    isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveLocalCategories(categories);
  return newCategory;
};

export const updateCategory = async (
  id: string,
  updates: { name?: string; slug?: string; coverImage?: string; isActive?: boolean }
): Promise<Category | null> => {
  if (isSupabaseConfigured() && supabase) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    else if (updates.name !== undefined) dbUpdates.slug = slugify(updates.name);
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

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
  if (updates.name && !updates.slug) updated.slug = slugify(updates.name);
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

  saveLocalCategories(getLocalCategories().filter((c) => c.id !== id));
  return true;
};
