-- Migration: Add Catalog Views & Customer Reviews Tables for Pink Pulse ERP
-- Updated: Security Hardening for catalog_views and catalog_reviews RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. CATALOG VIEWS COUNTER (EXCLUSIVELY ANONYMOUS STATS FOR ADMIN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS catalog_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_str VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 2. CATALOG REVIEWS & RATINGS (PUBLIC SUBMISSION + ADMIN MODERATION)
-- =========================================================================
CREATE TABLE IF NOT EXISTS catalog_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Row Level Security (RLS) Setup
ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_reviews ENABLE ROW LEVEL SECURITY;

-- Drop all previous policies on catalog_views and catalog_reviews to ensure clean state
DROP POLICY IF EXISTS "Allow anon insert catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow authenticated full catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow public insert catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow admin select catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow admin update catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow admin delete catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Allow admin manage catalog views" ON catalog_views;

DROP POLICY IF EXISTS "Allow public select approved reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow public insert pending reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow authenticated full catalog reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow admin select all reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow admin update reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow admin delete reviews" ON catalog_reviews;
DROP POLICY IF EXISTS "Allow admin insert reviews" ON catalog_reviews;

-- =========================================================================
-- 3. POLICIES FOR CATALOG_VIEWS
-- =========================================================================

-- Public (anon & authenticated) can insert view access logs
CREATE POLICY "Allow public insert catalog views" ON catalog_views 
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Authenticated ADMINS can SELECT view statistics
CREATE POLICY "Allow admin select catalog views" ON catalog_views 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Authenticated ADMINS can UPDATE/DELETE view entries
CREATE POLICY "Allow admin update catalog views" ON catalog_views 
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admin delete catalog views" ON catalog_views 
    FOR DELETE 
    TO authenticated 
    USING (true);

-- =========================================================================
-- 4. POLICIES FOR CATALOG_REVIEWS
-- =========================================================================

-- Public (anon & authenticated) can SELECT ONLY approved reviews
CREATE POLICY "Allow public select approved reviews" ON catalog_reviews 
    FOR SELECT 
    TO public 
    USING (status = 'approved');

-- Public (anon & authenticated) can INSERT new reviews, STRICTLY with status = 'pending'
CREATE POLICY "Allow public insert pending reviews" ON catalog_reviews 
    FOR INSERT 
    TO public 
    WITH CHECK (status = 'pending');

-- Authenticated ADMINS can SELECT all reviews (pending, approved, hidden)
CREATE POLICY "Allow admin select all reviews" ON catalog_reviews 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Authenticated ADMINS can INSERT reviews with any status
CREATE POLICY "Allow admin insert reviews" ON catalog_reviews 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Authenticated ADMINS can UPDATE review status (approve, hide, etc)
CREATE POLICY "Allow admin update reviews" ON catalog_reviews 
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Authenticated ADMINS can DELETE reviews
CREATE POLICY "Allow admin delete reviews" ON catalog_reviews 
    FOR DELETE 
    TO authenticated 
    USING (true);

-- =========================================================================
-- 5. EXPLICIT GRANTS & PRIVILEGES HARDENING
-- =========================================================================

-- Revoke default privileges
REVOKE ALL ON catalog_views FROM public, anon, authenticated;
REVOKE ALL ON catalog_reviews FROM public, anon, authenticated;

-- Grants for catalog_views
GRANT INSERT ON catalog_views TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON catalog_views TO authenticated;

-- Grants for catalog_reviews
GRANT SELECT, INSERT ON catalog_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON catalog_reviews TO authenticated;


