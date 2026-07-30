-- Africana Driver Connect — Supabase schema
-- Marketplace model: vehicles, bookings, availability, reviews, payments, messages

-- ============================================================================
-- MIGRATION: Add missing columns to existing tables
-- ============================================================================
-- Run these first if tables already exist without the newer columns.

ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ghana';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS seats INTEGER;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS doors INTEGER;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS has_gps BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS price_per_week NUMERIC(10,2);
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS price_per_month NUMERIC(10,2);
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(10,2) DEFAULT 0;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS minimum_rent_days INTEGER DEFAULT 1;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- ============================================================================
-- 1. PROFILES
-- Extends auth.users with app-specific role and profile data.
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('driver', 'owner', 'client', 'corporate')),
  bio TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Ghana',
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 2. VEHICLES
-- Vehicle listings by owners. This is the core inventory.
-- ============================================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('car', 'van', 'bus', 'truck', 'motorcycle', 'heavy_equipment', 'boat')),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)::int + 1),
  color TEXT,
  license_plate TEXT,
  transmission TEXT CHECK (transmission IN ('manual', 'automatic')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'gas')),
  seats INTEGER CHECK (seats > 0),
  doors INTEGER CHECK (doors > 0),
  has_ac BOOLEAN DEFAULT true,
  has_gps BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  price_per_day NUMERIC(10,2) NOT NULL CHECK (price_per_day >= 0),
  price_per_week NUMERIC(10,2),
  price_per_month NUMERIC(10,2),
  security_deposit NUMERIC(10,2) DEFAULT 0 CHECK (security_deposit >= 0),
  minimum_rent_days INTEGER DEFAULT 1 CHECK (minimum_rent_days > 0),
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'rented')),
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_city ON vehicles(city);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price_per_day);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert their own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = owner_id);


-- ============================================================================
-- 3. VEHICLE AVAILABILITY
-- Calendar slots for when a vehicle is available for rent.
-- ============================================================================
CREATE TABLE IF NOT EXISTS vehicle_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_availability_vehicle ON vehicle_availability(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_availability_dates ON vehicle_availability(start_date, end_date);

ALTER TABLE vehicle_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle owners can manage availability" ON vehicle_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_availability.vehicle_id AND vehicles.owner_id = auth.uid()
    )
  );

CREATE POLICY "Availability is viewable by everyone" ON vehicle_availability
  FOR SELECT USING (true);


-- ============================================================================
-- 4. BOOKINGS
-- Core booking/rental transactions.
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  driver_fee NUMERIC(10,2) DEFAULT 0 CHECK (driver_fee >= 0),
  service_fee NUMERIC(10,2) DEFAULT 0 CHECK (service_fee >= 0),
  security_deposit NUMERIC(10,2) DEFAULT 0 CHECK (security_deposit >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT DEFAULT 'GHS',
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  pickup_time TIME,
  return_time TIME,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_return_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Owners can view bookings for their vehicles" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles WHERE vehicles.id = bookings.vehicle_id AND vehicles.owner_id = auth.uid()
    )
  );

CREATE POLICY "Renters can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Owners can update booking status for their vehicles" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vehicles WHERE vehicles.id = bookings.vehicle_id AND vehicles.owner_id = auth.uid()
    )
  );

CREATE POLICY "Renters can cancel their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = renter_id);


-- ============================================================================
-- 5. REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_public = true OR auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);


-- ============================================================================
-- 6. TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  payee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'GHS',
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'payout', 'service_fee', 'security_deposit', 'penalty')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('mobile_money', 'card', 'cash', 'bank_transfer')),
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payer ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payee ON transactions(payee_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (false);


-- ============================================================================
-- 7. MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their messages as read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);


-- ============================================================================
-- 8. FAVORITES / SAVED VEHICLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vehicle ON favorites(vehicle_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================================
-- 9. DRIVER PROFILES
-- Standalone driver profiles for hire, not necessarily vehicle owners.
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT,
  license_class TEXT,
  license_expiry DATE,
  years_of_experience INTEGER CHECK (years_of_experience >= 0),
  preferred_vehicle_types TEXT[] DEFAULT '{}',
  available_for_hire BOOLEAN DEFAULT true,
  hourly_rate NUMERIC(10,2),
  daily_rate NUMERIC(10,2),
  weekly_rate NUMERIC(10,2),
  monthly_rate NUMERIC(10,2),
  bio TEXT,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_trips INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  id_document_url TEXT,
  selfie_url TEXT,
  police_clearance_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_available ON driver_profiles(available_for_hire);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Driver profiles are viewable by authenticated users" ON driver_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own driver profile" ON driver_profiles
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================================
-- 10. CORPORATE ACCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  company_registration TEXT,
  tax_id TEXT,
  industry TEXT,
  org_size TEXT CHECK (org_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  website TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Ghana',
  contact_person_name TEXT,
  contact_person_phone TEXT,
  contact_person_email TEXT,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_user ON corporate_accounts(user_id);

ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own corporate account" ON corporate_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own corporate account" ON corporate_accounts
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================
-- Update vehicle rating when reviews change
CREATE OR REPLACE FUNCTION public.update_vehicle_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE vehicles
    SET
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE vehicle_id = NEW.vehicle_id AND is_public = true
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE vehicle_id = NEW.vehicle_id AND is_public = true
      )
    WHERE id = NEW.vehicle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vehicles
    SET
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE vehicle_id = OLD.vehicle_id AND is_public = true
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE vehicle_id = OLD.vehicle_id AND is_public = true
      )
    WHERE id = OLD.vehicle_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_rating();

-- Update profile verification status based on reviews
CREATE OR REPLACE FUNCTION public.update_profile_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET verification_status = 'verified'
    WHERE id = NEW.reviewee_id AND NEW.rating >= 4;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_verification();
