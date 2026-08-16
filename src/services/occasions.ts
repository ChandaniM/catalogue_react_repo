import type { Occasion } from '../types';

const OCCASIONS_STORAGE_KEY = 'uphar_occasions';

export const DUMMY_OCCASIONS: Occasion[] = [
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'anniversary', label: 'Anniversary', icon: '💑' },
  { key: 'wedding', label: 'Wedding', icon: '💍' },
  { key: 'corporate', label: 'Corporate', icon: '🏢' },
  { key: 'festive', label: 'Festive', icon: '🪔' },
  { key: 'new-baby', label: 'New Baby', icon: '🍼' },
  { key: 'thank-you', label: 'Thank You', icon: '🙏' },
  { key: 'just-because', label: 'Just Because', icon: '🎁' },
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

export const saveOccasions = (items: Occasion[]): Occasion[] => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(OCCASIONS_STORAGE_KEY, JSON.stringify(items));
  }
  return items;
};

export const fetchOccasions = async (): Promise<Occasion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredOccasions()), 120);
  });
};
