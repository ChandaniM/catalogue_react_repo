import type { Occasion } from '../types';

export const DUMMY_OCCASIONS: Occasion[] = [
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'festive', label: 'Festive' },
  { key: 'new-baby', label: 'New Baby' },
  { key: 'thank-you', label: 'Thank You' },
  { key: 'just-because', label: 'Just Because' },
];

export const fetchOccasions = async (): Promise<Occasion[]> => {
  // Placeholder for future API-driven occasions (admin-manageable)
  return new Promise((resolve) => setTimeout(() => resolve(DUMMY_OCCASIONS), 120));
};
