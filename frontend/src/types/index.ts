export type Role = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SortField = 'price' | 'created_at' | 'make' | 'quantity';
export type SortOrder = 'asc' | 'desc';

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface Order {
  id: number;
  user_id: number;
  vehicle_id: number;
  quantity: number;
  price_at_purchase: number;
  make: string;
  model: string;
  created_at: string;
}
