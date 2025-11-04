-- Naveo Marketplace - Initial Schema Migration
-- Este archivo crea todas las tablas necesarias para el marketplace

-- =====================================================
-- 1. EXTENSIONES
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLAS DE USUARIOS Y PERFILES
-- =====================================================

-- Tabla de perfiles públicos
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de vendedor
CREATE TABLE IF NOT EXISTS public.seller_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('individual', 'dealership')),
  ruc_dni TEXT,
  address TEXT,
  city TEXT,
  department TEXT,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_sales INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos de verificación
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('dni', 'ruc', 'license', 'utility_bill')),
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLAS DE VEHÍCULOS
-- =====================================================

-- Tabla principal de vehículos
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Información básica
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Detalles del vehículo
  type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  price DECIMAL(12,2) NOT NULL CHECK (price > 0),
  negotiable BOOLEAN DEFAULT true,
  
  -- Especificaciones
  mileage INTEGER CHECK (mileage >= 0),
  transmission TEXT CHECK (transmission IN ('manual', 'automatic', 'semi-automatic')),
  fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'gas')),
  engine_size TEXT,
  color TEXT,
  doors INTEGER CHECK (doors > 0),
  seats INTEGER CHECK (seats > 0),
  
  -- Condición
  condition TEXT CHECK (condition IN ('new', 'used-excellent', 'used-good', 'used-fair')),
  owners_count INTEGER DEFAULT 1,
  accident_history BOOLEAN DEFAULT false,
  service_history BOOLEAN DEFAULT false,
  
  -- Ubicación
  city TEXT NOT NULL,
  department TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Estado y visibilidad
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'sold', 'expired')),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Promoción
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  boost_level INTEGER DEFAULT 0 CHECK (boost_level >= 0 AND boost_level <= 3),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes de vehículos
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de características adicionales
CREATE TABLE IF NOT EXISTS public.vehicle_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('safety', 'comfort', 'entertainment', 'exterior')),
  name TEXT NOT NULL,
  value TEXT
);

-- Tabla de historial de cambios
CREATE TABLE IF NOT EXISTS public.vehicle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'published', 'paused', 'sold')),
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_seller ON public.vehicles(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type_brand ON public.vehicles(type, brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON public.vehicles(city, department);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON public.vehicles(is_featured, featured_until) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vehicles_created ON public.vehicles(created_at DESC);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_vehicles_search_filters 
ON public.vehicles(status, type, brand, city) 
WHERE status = 'active';

-- =====================================================
-- 5. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en vehicles
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Todos pueden ver perfiles públicos
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (para el trigger)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS RLS PARA SELLER_DETAILS
-- =====================================================

-- Todos pueden ver detalles de vendedores activos
CREATE POLICY "Seller details are viewable by everyone"
  ON public.seller_details FOR SELECT
  USING (active = true);

-- Los vendedores pueden actualizar sus propios detalles
CREATE POLICY "Sellers can update own details"
  ON public.seller_details FOR UPDATE
  USING (
    auth.uid() = profile_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Los usuarios pueden crear sus detalles de vendedor
CREATE POLICY "Users can create seller details"
  ON public.seller_details FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA VEHICLES
-- =====================================================

-- Todos pueden ver vehículos activos
CREATE POLICY "Active vehicles are viewable by everyone"
  ON public.vehicles FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Los vendedores pueden crear vehículos
CREATE POLICY "Sellers can create vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Los vendedores pueden actualizar sus propios vehículos
CREATE POLICY "Sellers can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = seller_id);

-- Los vendedores pueden eliminar sus propios vehículos
CREATE POLICY "Sellers can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = seller_id);

-- =====================================================
-- POLÍTICAS RLS PARA VEHICLE_IMAGES
-- =====================================================

-- Todos pueden ver imágenes de vehículos activos
CREATE POLICY "Vehicle images are viewable"
  ON public.vehicle_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE id = vehicle_id AND (status = 'active' OR seller_id = auth.uid())
    )
  );

-- Los vendedores pueden gestionar imágenes de sus vehículos
CREATE POLICY "Sellers can manage vehicle images"
  ON public.vehicle_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE id = vehicle_id AND seller_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA VEHICLE_FEATURES
-- =====================================================

-- Todos pueden ver características de vehículos activos
CREATE POLICY "Vehicle features are viewable"
  ON public.vehicle_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE id = vehicle_id AND (status = 'active' OR seller_id = auth.uid())
    )
  );

-- Los vendedores pueden gestionar características de sus vehículos
CREATE POLICY "Sellers can manage vehicle features"
  ON public.vehicle_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE id = vehicle_id AND seller_id = auth.uid()
    )
  );

-- =====================================================
-- 7. STORAGE BUCKETS
-- =====================================================

-- Crear bucket para imágenes de vehículos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para documentos de verificación (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para vehicle-images
CREATE POLICY "Anyone can view vehicle images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own vehicle images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own vehicle images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas de storage para verification-documents
CREATE POLICY "Users can view own verification documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 8. DATOS INICIALES (OPCIONAL)
-- =====================================================

-- Puedes agregar aquí datos de prueba si lo deseas
-- Por ejemplo, ciudades, marcas de vehículos, etc.

COMMENT ON TABLE public.profiles IS 'Perfiles públicos de usuarios';
COMMENT ON TABLE public.seller_details IS 'Información adicional para vendedores';
COMMENT ON TABLE public.vehicles IS 'Catálogo de vehículos publicados';
COMMENT ON TABLE public.vehicle_images IS 'Imágenes de los vehículos';