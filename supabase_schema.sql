-- MAYA EXPRESS: DATABASE SCHEMA (SUPABASE / POSTGRESQL)

-- 1. ENUMS & TYPES
CREATE TYPE order_status_enum AS ENUM (
  'borrador', 
  'confirmada', 
  'transito', 
  'bodega', 
  'cerrada'
);

CREATE TYPE user_role_enum AS ENUM (
  'admin',
  'warehouse',
  'logistics',
  'finance'
);

CREATE TYPE driver_status_enum AS ENUM (
  'disponible',
  'asignado',
  'descanso',
  'mantenimiento',
  'baja'
);

CREATE TYPE unit_status_enum AS ENUM (
  'disponible',
  'asignado',
  'mantenimiento',
  'fuera_servicio',
  'baja'
);

-- 2. TABLES

-- Clients: Core customer entities
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  delivery_address TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  destination_default TEXT,
  delivery_method_default TEXT,
  insurance_default TEXT,
  pickup_required_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles: Extended user data (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role_enum DEFAULT 'logistics',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers: Supply/Origin entities
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact_name TEXT,
  phone TEXT,
  products JSONB, -- Catalog of products
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers: Operative personnel
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  license TEXT,
  rfc TEXT,
  status driver_status_enum DEFAULT 'disponible',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_status_change TIMESTAMPTZ DEFAULT NOW()
);

-- Units: Fleet assets
CREATE TABLE units (
  id TEXT PRIMARY KEY, -- e.g. 'PERMON 117'
  plates TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  unit_type TEXT,
  status unit_status_enum DEFAULT 'disponible',
  current_location TEXT,
  color_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_status_change TIMESTAMPTZ DEFAULT NOW()
);

-- Service Orders: Main transaction record
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  
  status order_status_enum NOT NULL DEFAULT 'borrador',
  guide_number TEXT UNIQUE NOT NULL,
  sheet_name TEXT,
  trip_number TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  delivery_method TEXT,
  
  reception_date DATE NOT NULL,
  est_departure TIMESTAMPTZ,
  est_arrival TIMESTAMPTZ,
  reception_temp TEXT,
  conservation_system TEXT,
  shipping_unit_refrigeration TEXT,
  reception TEXT,
  delivery TEXT,
  second_delivery TEXT,
  observations TEXT,
  
  -- Snapshots for historical integrity (captures state at time of order)
  client_snapshot JSONB,
  provider_snapshot JSONB,
  
  -- Logistics & Documentation (Flattened from React state)
  insurance TEXT,
  client_invoice TEXT,
  invoice_value NUMERIC(15, 2),
  payment_method TEXT,
  shipping_method TEXT,
  requires_invoice BOOLEAN DEFAULT FALSE,
  pallet_weight NUMERIC(10, 2),
  pallet_count INTEGER,
  
  -- Workflow Flags
  includes_pickup BOOLEAN DEFAULT TRUE,
  includes_shipping BOOLEAN DEFAULT TRUE,
  includes_delivery BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Order Products: Linked line items
CREATE TABLE service_order_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  temperature TEXT,
  weight NUMERIC(10, 2),
  volume NUMERIC(10, 2),
  pieces INTEGER,
  unit_measure TEXT,
  others TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Order Attachments: Photographic evidence
CREATE TABLE service_order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Status History: Audit trail
CREATE TABLE driver_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  old_status driver_status_enum,
  new_status driver_status_enum NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit Status History: Audit trail
CREATE TABLE unit_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  old_status unit_status_enum,
  new_status unit_status_enum NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES for Performance
CREATE INDEX idx_service_orders_guide_number ON service_orders (guide_number);
CREATE INDEX idx_service_orders_status ON service_orders (status);
CREATE INDEX idx_service_orders_client_id ON service_orders (client_id);
CREATE INDEX idx_products_order_id ON service_order_products (order_id);

-- 4. TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. PERMISSIONS
-- Grant access to anon and authenticated roles (standard for Supabase)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 6. AUTH TRIGGERS
-- Create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'logistics');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

