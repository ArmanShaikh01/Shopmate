-- ============================================================
-- STOCK MANAGEMENT FUNCTIONS
-- ============================================================
-- Critical business logic for managing product stock with
-- temporary reservations and permanent reductions

-- ============================================================
-- FUNCTION: Reserve Stock for Order
-- ============================================================
-- Temporarily reserves stock when an order is created
-- Uses row-level locks to prevent concurrent overbooking

CREATE OR REPLACE FUNCTION reserve_stock_for_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_available INTEGER;
BEGIN
  -- Loop through all items in the order
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Lock the product row to prevent concurrent modifications
    SELECT stock_quantity - reserved_quantity INTO v_available
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;
    
    -- Check if enough stock is available
    IF v_available < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
    END IF;
    
    -- Reserve the stock
    UPDATE products
    SET reserved_quantity = reserved_quantity + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Release Stock for Order
-- ============================================================
-- Releases reserved stock when an order is cancelled or expired
-- Returns stock to available pool

CREATE OR REPLACE FUNCTION release_stock_for_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Loop through all items in the order
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Release the reserved stock
    UPDATE products
    SET reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
    WHERE id = v_item.product_id;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Finalize Stock for Order
-- ============================================================
-- Permanently reduces stock when order is packed
-- Moves from reserved to actually consumed

CREATE OR REPLACE FUNCTION finalize_stock_for_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Loop through all items in the order
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Reduce both stock_quantity and reserved_quantity
    UPDATE products
    SET 
      stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
      reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
    WHERE id = v_item.product_id;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Check Stock Availability
-- ============================================================
-- Checks if sufficient stock is available for a given product
-- Returns available quantity (stock - reserved)

CREATE OR REPLACE FUNCTION check_stock_availability(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT stock_quantity - reserved_quantity INTO v_available
  FROM products
  WHERE id = p_product_id;
  
  RETURN v_available >= p_quantity;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION reserve_stock_for_order IS 
  'Temporarily reserves stock for pending order. Uses row locks to prevent overbooking.';

COMMENT ON FUNCTION release_stock_for_order IS 
  'Releases reserved stock when order is cancelled or expired.';

COMMENT ON FUNCTION finalize_stock_for_order IS 
  'Permanently reduces stock when order is packed and ready for delivery.';

COMMENT ON FUNCTION check_stock_availability IS 
  'Checks if sufficient stock is available for a product.';
