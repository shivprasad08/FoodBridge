-- =============================================
-- FoodBridge Database Schema
-- PostgreSQL (Supabase)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- User Roles
CREATE TYPE user_role AS ENUM ('provider', 'volunteer', 'recipient');

-- Food Listing Status
CREATE TYPE listing_status AS ENUM ('Available', 'Reserved', 'Collected', 'Delivered', 'Expired');

-- Task Status
CREATE TYPE task_status AS ENUM ('Assigned', 'PickedUp', 'Delivered', 'Confirmed');

-- =============================================
-- TABLES
-- =============================================

-- 1. Users Table
-- Extends Supabase auth.users with application-specific data
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    organization_name VARCHAR(255), -- For providers and recipients
    location_address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Food Listings Table
CREATE TABLE food_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
    food_type VARCHAR(100), -- e.g., "Cooked Meals", "Raw Vegetables", "Bakery Items"
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    pickup_time_start TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_time_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status listing_status DEFAULT 'Available',
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (pickup_time_end > pickup_time_start),
    CHECK (pickup_time_start >= NOW()) -- Cannot schedule in the past
);

-- 3. Tasks Table
-- Represents volunteer delivery assignments
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status task_status DEFAULT 'Assigned',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (volunteer_id IS NOT NULL OR status = 'Assigned'),
    CHECK (picked_up_at IS NULL OR picked_up_at >= assigned_at),
    CHECK (delivered_at IS NULL OR delivered_at >= picked_up_at),
    CHECK (confirmed_at IS NULL OR confirmed_at >= delivered_at)
);

-- 4. Audit Logs Table
-- For tracking all critical actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., "LISTING_CREATED", "TASK_ACCEPTED"
    entity_type VARCHAR(50), -- e.g., "food_listing", "task"
    entity_id UUID,
    details JSONB, -- Flexible field for additional context
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES (Performance Optimization)
-- =============================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location_lat, location_lng);
CREATE INDEX idx_users_email ON users(email);

-- Food Listings
CREATE INDEX idx_listings_provider ON food_listings(provider_id);
CREATE INDEX idx_listings_status ON food_listings(status);
CREATE INDEX idx_listings_location ON food_listings(pickup_lat, pickup_lng);
CREATE INDEX idx_listings_pickup_time ON food_listings(pickup_time_start);
CREATE INDEX idx_listings_created_at ON food_listings(created_at DESC);

-- Tasks
CREATE INDEX idx_tasks_listing ON tasks(listing_id);
CREATE INDEX idx_tasks_volunteer ON tasks(volunteer_id);
CREATE INDEX idx_tasks_recipient ON tasks(recipient_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own data
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Food Listings: Providers can CRUD their own, others can view Available
CREATE POLICY "Providers can manage own listings"
    ON food_listings FOR ALL
    USING (auth.uid() = provider_id);

CREATE POLICY "All authenticated users can view available listings"
    ON food_listings FOR SELECT
    USING (auth.role() = 'authenticated');

-- Tasks: Volunteers can view assigned tasks, recipients can view deliveries
CREATE POLICY "Volunteers can view assigned tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = volunteer_id);

CREATE POLICY "Recipients can view incoming tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Volunteers can update assigned tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = volunteer_id);

-- Audit Logs: Admin read-only (modify as needed)
CREATE POLICY "Audit logs insert only"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON food_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Note: In production, users are created via Supabase Auth
-- This is just for reference

-- INSERT INTO users (id, role, name, email, location_lat, location_lng) VALUES
-- (uuid_generate_v4(), 'provider', 'Hotel Taj', 'taj@example.com', 19.0760, 72.8777),
-- (uuid_generate_v4(), 'volunteer', 'Ravi Kumar', 'ravi@example.com', 19.0896, 72.8656),
-- (uuid_generate_v4(), 'recipient', 'Hope Foundation', 'hope@example.com', 19.0830, 72.8820);

-- =============================================
-- NOTES
-- =============================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Ensure auth.users table exists (default in Supabase)
-- 3. Configure RLS policies based on your security requirements
-- 4. Update trigger logic if needed for business rules
