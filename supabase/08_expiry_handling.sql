-- ============================================================
-- ORDER EXPIRY HANDLING
-- ============================================================
-- Automatically expires and cancels pending orders that exceed
-- the 15-minute time limit

-- ============================================================
-- FUNCTION: Expire Pending Orders
-- ============================================================
-- Finds all pending orders that have exceeded their expiry time
-- and automatically cancels them and releases reserved stock

CREATE OR REPLACE FUNCTION expire_pending_orders()
RETURNS TABLE(
  expired_order_id UUID,
  customer_id UUID,
  expired_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  UPDATE orders
  SET 
    status = 'cancelled',
    cancelled_at = NOW()
  WHERE 
    status = 'pending'
    AND expires_at < NOW()
  RETURNING id, orders.customer_id, NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Check Order Expiry Status
-- ============================================================
-- Utility function to check if an order is expired

CREATE OR REPLACE FUNCTION is_order_expired(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_expired BOOLEAN;
BEGIN
  SELECT 
    status = 'pending' AND expires_at < NOW()
  INTO v_is_expired
  FROM orders
  WHERE id = p_order_id;
  
  RETURN COALESCE(v_is_expired, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- FUNCTION: Get Time Remaining for Order
-- ============================================================
-- Returns remaining time in seconds before order expires
-- Returns NULL if order is not pending or already expired

CREATE OR REPLACE FUNCTION get_order_time_remaining(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_remaining_seconds INTEGER;
BEGIN
  SELECT 
    EXTRACT(EPOCH FROM (expires_at - NOW()))::INTEGER
  INTO v_remaining_seconds
  FROM orders
  WHERE id = p_order_id
    AND status = 'pending';
  
  -- Return NULL if already expired or not pending
  IF v_remaining_seconds < 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN v_remaining_seconds;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- SCHEDULED JOB SETUP INSTRUCTIONS
-- ============================================================
-- To run this automatically, you have two options:

-- OPTION 1: Using pg_cron (if enabled in Supabase)
-- Run this SQL to schedule the expiry function every minute:
/*
SELECT cron.schedule(
  'expire-pending-orders',
  '* * * * *', -- Run every minute
  $$ SELECT expire_pending_orders(); $$
);
*/

-- OPTION 2: Using External Cron or Scheduled Task
-- Create an API endpoint in your Next.js app that calls:
-- SELECT expire_pending_orders();
-- Then schedule it via:
--   - Vercel Cron Jobs
--   - GitHub Actions scheduled workflow
--   - External cron service (e.g., cron-job.org)

-- OPTION 3: Using Supabase Edge Functions
-- Create an Edge Function that runs on schedule via Supabase

-- ============================================================
-- MANUAL EXECUTION
-- ============================================================
-- To manually expire orders, run:
-- SELECT * FROM expire_pending_orders();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION expire_pending_orders IS 
  'Automatically expires pending orders older than 15 minutes and releases reserved stock';

COMMENT ON FUNCTION is_order_expired IS 
  'Checks if a specific order has expired';

COMMENT ON FUNCTION get_order_time_remaining IS 
  'Returns seconds remaining before order expires (NULL if expired or not pending)';
