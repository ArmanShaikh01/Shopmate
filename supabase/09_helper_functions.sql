-- ============================================================
-- HELPER FUNCTIONS - Utility Functions for Role Management
-- ============================================================

-- ============================================================
-- FUNCTION: Check if Current User is Shopkeeper
-- ============================================================
-- Returns true if the authenticated user has shopkeeper role

CREATE OR REPLACE FUNCTION is_shopkeeper()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'shopkeeper'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get Current User Role
-- ============================================================
-- Returns the role of the currently authenticated user

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get User Profile
-- ============================================================
-- Returns complete profile information for current user

CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE(
  id UUID,
  role user_role,
  full_name TEXT,
  phone TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.full_name,
    p.phone,
    p.metadata,
    p.created_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Create Shopkeeper Account (ADMIN ONLY)
-- ============================================================
-- Safely creates a shopkeeper account
-- NOTE: This function should only be callable by database admins
-- or via a secure backend process

CREATE OR REPLACE FUNCTION create_shopkeeper_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  -- Update the user's profile to shopkeeper role
  UPDATE profiles
  SET 
    role = 'shopkeeper',
    full_name = p_full_name,
    phone = p_phone
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for ID: %', p_user_id;
  END IF;
  
  RETURN p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get All Shopkeepers (Shopkeeper Only)
-- ============================================================
-- Returns list of all shopkeeper accounts
-- Only accessible by shopkeepers

CREATE OR REPLACE FUNCTION get_all_shopkeepers()
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verify caller is shopkeeper
  IF NOT is_shopkeeper() THEN
    RAISE EXCEPTION 'Access denied: shopkeeper role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.created_at
  FROM profiles p
  WHERE p.role = 'shopkeeper'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Verify Order Access
-- ============================================================
-- Checks if current user can access a specific order
-- Returns true if user is the customer or is a shopkeeper

CREATE OR REPLACE FUNCTION can_access_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Get the customer_id for the order
  SELECT customer_id INTO v_customer_id
  FROM orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Allow access if user is the customer or is a shopkeeper
  RETURN (
    auth.uid() = v_customer_id OR
    is_shopkeeper()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION is_shopkeeper IS 
  'Returns true if current authenticated user is a shopkeeper';

COMMENT ON FUNCTION get_user_role IS 
  'Returns role of current authenticated user';

COMMENT ON FUNCTION get_current_user_profile IS 
  'Returns complete profile information for current user';

COMMENT ON FUNCTION create_shopkeeper_profile IS 
  'Elevates a user account to shopkeeper role (admin only)';

COMMENT ON FUNCTION get_all_shopkeepers IS 
  'Returns list of all shopkeeper accounts (shopkeeper access only)';

COMMENT ON FUNCTION can_access_order IS 
  'Checks if current user can access a specific order';
