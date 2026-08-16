export interface Category {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  costPrice: number;
  sellingPrice: number;
  quantity?: number;
  soldQuantity?: number;
  tags?: string[];
  categoryId: string;
  createdAt?: string;
  isNewArrival?: boolean;
  isDeal?: boolean;
  isPreOrder?: boolean;
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  button: string;
  image: string;
}

export interface Occasion {
  key: string;
  label: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}
