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
  tags?: string[];
  categoryId: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}
