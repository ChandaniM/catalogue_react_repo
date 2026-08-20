import { DUMMY_SLIDES } from '../data/slides';
import type { Slide } from '../types';

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

export const fetchSlides = async (): Promise<Slide[]> => getLocalSlides();

export const saveSlides = async (slides: Slide[]): Promise<void> => {
  saveLocalSlides(slides);
};
