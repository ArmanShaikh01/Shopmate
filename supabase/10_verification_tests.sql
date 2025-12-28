-- ============================================================
-- VERIFICATION AND TESTING SQL
-- ============================================================
-- Use this file to verify the database setup and test
-- role-based access control

-- ============================================================
-- SECTION 1: Create Test Shopkeeper Account
-- ============================================================

-- IMPORTANT: First create a user via Supabase Auth Dashboard or API
-- Then run this SQL to elevate them to shopkeeper role:

-- Step 1: Create user via Supabase Dashboard (Authentication > Users > Invite User)
--   Email: shopkeeper@example.com
--   Auto-generate password or set your own
--   Copy the user's UUID from the dashboard

-- Step 2: Elevate to shopkeeper (replace the UUID with actual user ID)
/*
SELECT create_shopkeeper_profile(
  'YOUR-USER-UUID-HERE'::UUID,
  'Shop Owner',
  '1234567890'
);
*/

-- Alternative: If you know the user's email, find their UUID first:
/*
SELECT id FROM auth.users WHERE email = 'shopkeeper@example.com';
*/

-- Then run:
/*
SELECT create_shopkeeper_profile(
  (SELECT id FROM auth.users WHERE email = 'shopkeeper@example.com'),
  'Shop Owner',
  '1234567890'
);
*/

-- ============================================================
-- SECTION 2: Verify Database Schema
-- ============================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output:
-- - order_items
-- - orders
-- - payments
-- - products
-- - profiles
-- - reminders

-- ============================================================
-- SECTION 3: Verify RLS Policies
-- ============================================================

-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- SECTION 4: Test Data Setup
-- ============================================================

-- As SHOPKEEPER, create some test products:
/*
INSERT INTO products (name, description, price, stock_quantity, category, is_active)
VALUES 
  ('Test Product 1', 'Description 1', 99.99, 100, 'Electronics', true),
  ('Test Product 2', 'Description 2', 49.99, 50, 'Clothing', true),
  ('Out of Stock Item', 'Description 3', 29.99, 0, 'Books', true);
*/

-- ============================================================
-- SECTION 5: Test Customer Access (Run as CUSTOMER user)
-- ============================================================

-- Test 1: Customer can view active products
/*
SELECT id, name, price, stock_quantity, reserved_quantity
FROM products
WHERE is_active = true;
*/
-- Should return all active products

-- Test 2: Customer CANNOT view all orders (should only see their own)
/*
SELECT * FROM orders;
*/
-- Should return only orders where customer_id = current user

-- Test 3: Customer CANNOT create products
/*
INSERT INTO products (name, price, stock_quantity)
VALUES ('Unauthorized Product', 99.99, 10);
*/
-- Should FAIL with permission denied error

-- ============================================================
-- SECTION 6: Test Shopkeeper Access (Run as SHOPKEEPER user)
-- ============================================================

-- Test 1: Shopkeeper can view ALL orders
/*
SELECT 
  o.id,
  o.customer_id,
  p.full_name as customer_name,
  o.status,
  o.total_amount,
  o.created_at
FROM orders o
JOIN profiles p ON p.id = o.customer_id
ORDER BY o.created_at DESC;
*/
-- Should return ALL orders from ALL customers

-- Test 2: Shopkeeper can create products
/*
INSERT INTO products (name, description, price, stock_quantity, category)
VALUES ('Shopkeeper Product', 'Test', 199.99, 25, 'Test Category')
RETURNING *;
*/
-- Should succeed

-- Test 3: Shopkeeper can update order status
/*
UPDATE orders
SET status = 'confirmed'
WHERE status = 'pending'
  AND id = 'SOME-ORDER-ID'
RETURNING *;
*/
-- Should succeed

-- ============================================================
-- SECTION 7: Test Stock Reservation Logic
-- ============================================================

-- As CUSTOMER, create a test order to verify stock reservation:

/*
-- Step 1: Create order
INSERT INTO orders (customer_id, delivery_address, delivery_phone, total_amount)
VALUES (auth.uid(), '123 Test Street', '1234567890', 0)
RETURNING id;

-- Step 2: Add items to order (use the order ID from above)
INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
VALUES (
  'YOUR-ORDER-ID'::UUID,
  (SELECT id FROM products WHERE name = 'Test Product 1' LIMIT 1),
  5,
  99.99
);

-- Step 3: Verify stock was reserved
SELECT 
  name,
  stock_quantity,
  reserved_quantity,
  (stock_quantity - reserved_quantity) as available_quantity
FROM products
WHERE name = 'Test Product 1';

-- Should show:
-- stock_quantity: 100
-- reserved_quantity: 5
-- available_quantity: 95
*/

-- ============================================================
-- SECTION 8: Test Order Cancellation & Stock Release
-- ============================================================

/*
-- Cancel the order
UPDATE orders
SET status = 'cancelled'
WHERE id = 'YOUR-ORDER-ID'::UUID;

-- Verify stock was released
SELECT 
  name,
  stock_quantity,
  reserved_quantity,
  (stock_quantity - reserved_quantity) as available_quantity
FROM products
WHERE name = 'Test Product 1';

-- Should show:
-- stock_quantity: 100
-- reserved_quantity: 0
-- available_quantity: 100
*/

-- ============================================================
-- SECTION 9: Test Order Packing & Final Stock Reduction
-- ============================================================

/*
-- Create new order (repeat steps from Section 7)
-- Then pack the order
UPDATE orders
SET status = 'packed'
WHERE id = 'YOUR-ORDER-ID'::UUID;

-- Verify stock was permanently reduced
SELECT 
  name,
  stock_quantity,
  reserved_quantity,
  (stock_quantity - reserved_quantity) as available_quantity
FROM products
WHERE name = 'Test Product 1';

-- Should show:
-- stock_quantity: 95 (reduced by 5)
-- reserved_quantity: 0 (released)
-- available_quantity: 95
*/

-- ============================================================
-- SECTION 10: Test Order Expiry
-- ============================================================

/*
-- Manually expire old pending orders
SELECT * FROM expire_pending_orders();

-- Verify expired orders are cancelled
SELECT id, status, expires_at, cancelled_at
FROM orders
WHERE expires_at < NOW() AND status = 'cancelled';
*/

-- ============================================================
-- SECTION 11: Role Verification Queries
-- ============================================================

-- Check current user's role
SELECT get_user_role();

-- Get current user's full profile
SELECT * FROM get_current_user_profile();

-- Check if current user is shopkeeper
SELECT is_shopkeeper();

-- List all shopkeepers (only works if you're a shopkeeper)
SELECT * FROM get_all_shopkeepers();

-- ============================================================
-- SECTION 12: Clean Up Test Data
-- ============================================================

/*
-- Delete test orders
DELETE FROM orders WHERE delivery_address = '123 Test Street';

-- Delete test products
DELETE FROM products WHERE name LIKE 'Test%' OR name LIKE '%Shopkeeper%';
*/
