import { DUMMY_SLIDES } from '../data/slides';
import type { Slide } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'uphar_slides';
const MIGRATION_KEY = 'uphar_slides_migrated_v1';

const getDefaultButtonUrl = (button = '') => button.toLowerCase().includes('new arrival') ? '/new-arrivals' : '/shop';

const applySlideDefaults = (slide: Partial<Slide>): Slide => ({
  id: slide.id || String(Date.now()),
  title: slide.title || '',
  subtitle: slide.subtitle || '',
  button: slide.button || '',
  buttonUrl: slide.buttonUrl || getDefaultButtonUrl(slide.button),
  button2: slide.button2 || '',
  button2Url: slide.button2Url || '/shop',
  image: slide.image || '',
});

const getLocalSlides = (): Slide[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  let slides: Slide[];

  if (stored) {
    try {
      slides = JSON.parse(stored).map((slide: Partial<Slide>) => applySlideDefaults(slide));
    } catch (err) {
      console.warn('Invalid slide cache, reseeding defaults.', err);
      slides = DUMMY_SLIDES.map((slide) => applySlideDefaults(slide));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
    }
  } else {
    slides = DUMMY_SLIDES.map((slide) => applySlideDefaults(slide));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
  }

  if (!localStorage.getItem(MIGRATION_KEY)) {
    const seeded = DUMMY_SLIDES.map((slide) => applySlideDefaults(slide));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
    localStorage.setItem(MIGRATION_KEY, 'true');
    return seeded;
  }

  return slides;
};

const saveLocalSlides = (slides: Slide[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
};

const mapFromDb = (row: Record<string, unknown>): Slide => applySlideDefaults({
  id: row.id as string,
  title: row.title as string,
  subtitle: row.subtitle as string,
  image: row.image_url as string,
  button: row.button_text as string,
  buttonUrl: row.button_url as string,
  button2: row.secondary_button_text as string,
  button2Url: row.secondary_button_url as string,
});

export const fetchSlides = async (): Promise<Slide[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (!error && data?.length) return data.map(mapFromDb);
    if (error) console.error('Error fetching slides:', error);
  }
  return getLocalSlides();
};

export const saveSlides = async (slides: Slide[]): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const { error: deleteError } = await supabase.from('slides').delete().neq('id', '');
    if (deleteError) {
      console.error('Error replacing slides:', deleteError);
      return;
    }
    const { error } = await supabase.from('slides').insert(slides.map((slide, index) => ({
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image,
      button_text: slide.button || null,
      button_url: slide.buttonUrl || null,
      secondary_button_text: slide.button2 || null,
      secondary_button_url: slide.button2Url || null,
      sort_order: index,
      is_active: true,
    })));
    if (error) {
      console.error('Error saving slides:', error);
      return;
    }
  }
  saveLocalSlides(slides);
};
