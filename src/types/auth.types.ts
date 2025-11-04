export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'buyer' | 'seller' | 'admin';
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  seller_details?: SellerDetails;
}

export interface SellerDetails {
  id: string;
  profile_id: string;
  business_name?: string;
  business_type?: 'individual' | 'dealership';
  ruc_dni?: string;
  address?: string;
  city?: string;
  department?: string;
  rating: number;
  total_sales: number;
  response_time_hours?: number;
  verified_at?: string;
  verified_by?: string;
  active: boolean;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SellerUpgradeData {
  business_name?: string;
  business_type: 'individual' | 'dealership';
  ruc_dni?: string;
  address?: string;
  city: string;
  department: string;
}

export interface VerificationDocument {
  id: string;
  profile_id: string;
  document_type: 'dni' | 'ruc' | 'license' | 'utility_bill';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}