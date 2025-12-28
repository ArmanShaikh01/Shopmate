-- ============================================================
-- FIX MISSING PROFILES
-- ============================================================
-- This script creates profiles for users who were created
-- before the trigger was fixed

-- Create missing profiles for existing users
INSERT INTO profiles (id, full_name, role)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'User') as full_name,
    'customer' as role
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Verify all users have profiles
SELECT 
    u.email,
    u.id,
    CASE 
        WHEN p.id IS NOT NULL THEN '✓ Has Profile'
        ELSE '✗ Missing Profile'
    END as status,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at;

-- If you need to manually set shopkeeper role for specific user
-- Uncomment and replace the email:
/*
UPDATE profiles
SET role = 'shopkeeper'
WHERE id = (SELECT id FROM auth.users WHERE email = 'shopkeeper@test.com');
*/
