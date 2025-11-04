export interface Vehicle {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  negotiable: boolean;
  mileage?: number;
  transmission?: 'manual' | 'automatic' | 'semi-automatic';
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'gas';
  engine_size?: string;
  color?: string;
  doors?: number;
  seats?: number;
  condition?: 'new' | 'used-excellent' | 'used-good' | 'used-fair';
  owners_count?: number;
  accident_history: boolean;
  service_history: boolean;
  city: string;
  department: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'draft' | 'active' | 'paused' | 'sold' | 'expired';
  published_at?: string;
  expires_at?: string;
  sold_at?: string;
  views_count: number;
  favorites_count: number;
  inquiries_count: number;
  is_featured: boolean;
  featured_until?: string;
  boost_level: number;
  created_at: string;
  updated_at: string;
  vehicle_images?: VehicleImage[];
  seller?: {
    full_name: string;
    avatar_url?: string;
    seller_details?: {
      business_name?: string;
      rating: number;
    };
  };
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  url: string;
  thumbnail_url?: string;
  medium_url?: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface VehicleFeature {
  id: string;
  vehicle_id: string;
  category: 'safety' | 'comfort' | 'entertainment' | 'exterior';
  name: string;
  value?: string;
}

export interface VehicleCreateData {
  title: string;
  description?: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  negotiable?: boolean;
  mileage?: number;
  transmission?: string;
  fuel_type?: string;
  engine_size?: string;
  color?: string;
  doors?: number;
  seats?: number;
  condition?: string;
  owners_count?: number;
  accident_history?: boolean;
  service_history?: boolean;
  city: string;
  department: string;
  address?: string;
}

export interface VehicleFilters {
  status?: string;
  type?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
}

export interface VehicleHistory {
  id: string;
  vehicle_id: string;
  user_id?: string;
  action: 'created' | 'updated' | 'published' | 'paused' | 'sold';
  changes: any;
  created_at: string;
}