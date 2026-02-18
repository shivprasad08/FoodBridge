-- Fix 1: Add the missing INSERT policy (if you haven't already)
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Fix 2: Manually create the missing user profile
-- Replace the UUID below with your actual user ID from auth.users
INSERT INTO users (id, role, name, email, phone)
VALUES (
    'b326882ab-d5c3-4a30-8cc1-fbb22fc15398'::uuid,  -- Your user ID from Supabase Auth
    'provider',
    'Shivprasad Mahind',
    'shivprasad.mahind@gmail.com',
    '8669820262'
)
ON CONFLICT (id) DO NOTHING;
