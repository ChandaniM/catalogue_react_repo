export interface FeatureFlags {
  newArrivalsEnabled: boolean;
  dealsEnabled: boolean;
  preOrdersEnabled: boolean;
  wishlistEnabled: boolean;
  productSharingEnabled: boolean;
  newArrivalAutoDays: number;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  newArrivalsEnabled: true,
  dealsEnabled: true,
  preOrdersEnabled: true,
  wishlistEnabled: true,
  productSharingEnabled: true,
  newArrivalAutoDays: 7,
};

const FEATURE_FLAGS_KEY = 'uphar_feature_flags';

export const loadFeatureFlags = (): FeatureFlags => {
  try {
    const stored = localStorage.getItem(FEATURE_FLAGS_KEY);
    if (!stored) return DEFAULT_FEATURE_FLAGS;
    const parsed = JSON.parse(stored) as Partial<FeatureFlags>;
    return { ...DEFAULT_FEATURE_FLAGS, ...parsed };
  } catch (error) {
    console.error('Unable to load feature flags:', error);
    return DEFAULT_FEATURE_FLAGS;
  }
};

export const saveFeatureFlags = (flags: FeatureFlags) => {
  try {
    localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  } catch (error) {
    console.error('Unable to save feature flags:', error);
  }
};
