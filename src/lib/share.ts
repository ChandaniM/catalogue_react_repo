export interface SharedSelectionItem {
  productId: string;
  quantity: number;
  source: 'cart' | 'wishlist';
}

export interface SharedSelection {
  token: string;
  createdAt: string;
  items: SharedSelectionItem[];
}

const SHARE_STORAGE_KEY = 'uphar_shared_selections';

const loadAllShares = (): Record<string, SharedSelection> => {
  try {
    const stored = localStorage.getItem(SHARE_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as Record<string, SharedSelection>;
  } catch (error) {
    console.error('Error reading shared selections', error);
    return {};
  }
};

const saveAllShares = (shares: Record<string, SharedSelection>) => {
  try {
    localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
  } catch (error) {
    console.error('Error saving shared selections', error);
  }
};

export const createShareToken = (items: SharedSelectionItem[]): string => {
  const token = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const all = loadAllShares();
  all[token] = {
    token,
    createdAt: new Date().toISOString(),
    items,
  };
  saveAllShares(all);
  return token;
};

export const loadShareSelection = (token: string): SharedSelection | null => {
  const all = loadAllShares();
  return all[token] || null;
};

export const getShareUrl = (token: string): string => `${window.location.origin}/share/${token}`;
