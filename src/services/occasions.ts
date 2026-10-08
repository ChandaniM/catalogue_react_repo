import type { Occasion } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const OCCASIONS_STORAGE_KEY = 'uphar_occasions';

export const DUMMY_OCCASIONS: Occasion[] = [
  { key: 'birthday', label: 'Birthday', icon: 'cake' },
  { key: 'anniversary', label: 'Anniversary', icon: 'heart' },
  { key: 'wedding', label: 'Wedding', icon: 'ring' },
  { key: 'corporate', label: 'Corporate', icon: 'briefcase' },
  { key: 'festive', label: 'Festive', icon: 'star' },
  { key: 'new-baby', label: 'New Baby', icon: 'baby' },
  { key: 'thank-you', label: 'Thank You', icon: 'heart' },
  { key: 'just-because', label: 'Just Because', icon: 'gift' },
];

export const getStoredOccasions = (): Occasion[] => {
  if (typeof window === 'undefined') return DUMMY_OCCASIONS;

  try {
    const saved = window.localStorage.getItem(OCCASIONS_STORAGE_KEY);
    if (!saved) return DUMMY_OCCASIONS;

    const parsed = JSON.parse(saved) as Occasion[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (error) {
    console.error('Unable to parse saved occasions:', error);
  }

  return DUMMY_OCCASIONS;
};

export const saveOccasions = async (items: Occasion[]): Promise<Occasion[]> => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(OCCASIONS_STORAGE_KEY, JSON.stringify(items));
  }
  if (isSupabaseConfigured() && supabase) {
    const { error: deleteError } = await supabase.from('occasions').delete().neq('id', '');
    if (deleteError) {
      console.error('Error replacing occasions:', deleteError);
      return items;
    }
    const { error } = await supabase.from('occasions').insert(items.map((item) => ({
      name: item.label,
      slug: item.key,
      icon: item.icon || null,
      icon_type: item.icon?.startsWith('http') ? 'image' : 'emoji',
      is_active: true,
    })));
    if (error) console.error('Error saving occasions:', error);
  }
  return items;
};

export const fetchOccasions = async (): Promise<Occasion[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('occasions')
      .select('name, slug, icon, image_url')
      .eq('is_active', true)
      .order('name');
    if (!error && data?.length) {
      return data.map((item) => ({ key: item.slug, label: item.name, icon: item.icon || item.image_url || '' }));
    }
    if (error) console.error('Error fetching occasions:', error);
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredOccasions()), 120);
  });
};
