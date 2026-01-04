-- Cleaned UpCycle Connect Schema for Supabase
-- Run in Supabase SQL Editor

-- ============================================
-- REQUIRED EXTENSIONS
-- ============================================
-- gen_random_uuid() requires pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('provider', 'seeker', 'admin')),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: unique constraint on email creates an index automatically.

-- ============================================
-- MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0), -- allow zero stock; change to > 0 if you prefer
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  location VARCHAR(255),
  latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
  provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, -- consider SET NULL or CASCADE depending on policy
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  carbon_saved NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_materials_provider ON public.materials(provider_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);
-- For geo queries, consider PostGIS instead of btree on lat/lon
CREATE INDEX IF NOT EXISTS idx_materials_location ON public.materials(latitude, longitude);

-- ============================================
-- REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  seeker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_seeker ON public.requests(seeker_id);
CREATE INDEX IF NOT EXISTS idx_requests_material ON public.requests(material_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);

-- ============================================
-- UPDATE updated_at TRIGGER FUNCTION
-- ============================================
-- Consolidated and schema-qualified name
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers (idempotent pattern: DROP IF EXISTS then CREATE)
-- Users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Materials
DROP TRIGGER IF EXISTS update_materials_updated_at ON public.materials;
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Requests
DROP TRIGGER IF EXISTS update_requests_updated_at ON public.requests;
CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if re-running
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_select_admin ON public.users;

DROP POLICY IF EXISTS materials_public_read ON public.materials;
DROP POLICY IF EXISTS materials_insert_owner ON public.materials;
DROP POLICY IF EXISTS materials_update_owner ON public.materials;
DROP POLICY IF EXISTS materials_delete_owner ON public.materials;

DROP POLICY IF EXISTS requests_select_owner ON public.requests;
DROP POLICY IF EXISTS requests_insert_owner ON public.requests;
DROP POLICY IF EXISTS requests_update_owner ON public.requests;
DROP POLICY IF EXISTS requests_delete_owner ON public.requests;

-- --------------------------
-- USERS policies
-- --------------------------
-- Allow users to read only their own profile
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid())::uuid = id);

-- Allow admins (based on JWT claim) to SELECT all users
CREATE POLICY users_select_admin ON public.users
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Prevent clients from reading password_hash via RLS: create view for public profile if needed
-- Example read-only view excluding password_hash:
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT id, email, name, role, location, created_at, updated_at
FROM public.users;
-- Revoke direct SELECT to enforce view usage if desired (requires careful permission management).

-- --------------------------
-- MATERIALS policies
-- --------------------------
-- Public read: allow SELECT for everyone (authenticated) if intended.
-- If you want truly public (including anonymous), set TO PUBLIC and USING (true).
CREATE POLICY materials_public_read ON public.materials
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserts: provider_id must equal auth.uid()
CREATE POLICY materials_insert_owner ON public.materials
  FOR INSERT
  TO authenticated
  WITH CHECK (provider_id = (SELECT auth.uid())::uuid);

-- Updates: only provider can update their materials
CREATE POLICY materials_update_owner ON public.materials
  FOR UPDATE
  TO authenticated
  USING (provider_id = (SELECT auth.uid())::uuid)
  WITH CHECK (provider_id = (SELECT auth.uid())::uuid);

-- Deletes: only provider can delete their materials
CREATE POLICY materials_delete_owner ON public.materials
  FOR DELETE
  TO authenticated
  USING (provider_id = (SELECT auth.uid())::uuid);

-- --------------------------
-- REQUESTS policies
-- --------------------------
-- Seeker can only see their requests
CREATE POLICY requests_select_owner ON public.requests
  FOR SELECT
  TO authenticated
  USING (seeker_id = (SELECT auth.uid())::uuid);

-- Insert: seeker_id must be the current user
CREATE POLICY requests_insert_owner ON public.requests
  FOR INSERT
  TO authenticated
  WITH CHECK (seeker_id = (SELECT auth.uid())::uuid);

-- Update: only seeker can modify their request (adjust if admins/providers need ability)
CREATE POLICY requests_update_owner ON public.requests
  FOR UPDATE
  TO authenticated
  USING (seeker_id = (SELECT auth.uid())::uuid)
  WITH CHECK (seeker_id = (SELECT auth.uid())::uuid);

-- Delete: only seeker can delete their request
CREATE POLICY requests_delete_owner ON public.requests
  FOR DELETE
  TO authenticated
  USING (seeker_id = (SELECT auth.uid())::uuid);

-- ============================================
-- OPTIONAL SAMPLE DATA (commented)
-- ============================================
/*
INSERT INTO public.users (email, password_hash, name, role, location) VALUES
('provider@example.com', '$2a$10$EXAMPLEHASH', 'John Provider', 'provider', 'New York, NY'),
('seeker@example.com', '$2a$10$EXAMPLEHASH', 'Jane Seeker', 'seeker', 'Los Angeles, CA');
*/

-- ============================================
-- NOTES & RECOMMENDATIONS
-- ============================================
-- 1) Passwords: Keep service_role key only on backend. Do not expose it client-side.
--    Consider creating server-side helper functions for authentication-sensitive operations.
-- 2) Admin role: The script assumes a JWT claim 'role' is present; ensure your Auth provider
--    includes custom claims (or adapt policy to your claim structure).
-- 3) Geo: For spatial queries at scale consider PostGIS (enable extension postgis) and store
--    geography(Point,4326) instead of two doubles.
-- 4) Audit: If you need to preserve deletions, consider using ON DELETE SET NULL or RESTRICT
--    and create a separate audit table for deletions.
-- 5) Indexes: Ensure you index columns used frequently in WHERE clauses and in RLS policies
--    (provider_id, seeker_id) — already added.