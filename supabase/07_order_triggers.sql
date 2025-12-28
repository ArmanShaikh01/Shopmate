-- ============================================================
-- ORDER LIFECYCLE TRIGGERS
-- ============================================================
-- Automatic stock management based on order status changes

-- ============================================================
-- TRIGGER: Reserve Stock on Order Creation
-- ============================================================
-- Automatically reserves stock when a new order is created

CREATE OR REPLACE FUNCTION handle_order_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Reserve stock for the new order
  PERFORM reserve_stock_for_order(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If reservation fails, prevent order creation
    RAISE EXCEPTION 'Cannot create order: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_created();

-- ============================================================
-- TRIGGER: Handle Stock on Order Status Change
-- ============================================================
-- Automatically manages stock based on order status transitions

CREATE OR REPLACE FUNCTION handle_order_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is cancelled, release reserved stock
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM release_stock_for_order(NEW.id);
  END IF;
  
  -- When order is packed, finalize stock reduction
  IF NEW.status = 'packed' AND OLD.status != 'packed' THEN
    PERFORM finalize_stock_for_order(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_stock_updated
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_stock_change();

-- ============================================================
-- TRIGGER: Prevent Order Modification After Completion
-- ============================================================
-- Prevents modification of order items after order is no longer pending

CREATE OR REPLACE FUNCTION prevent_completed_order_item_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_order_status order_status;
BEGIN
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  -- Only allow modifications to pending orders
  IF v_order_status != 'pending' THEN
    RAISE EXCEPTION 'Cannot modify items of non-pending order';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_order_item_update
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_completed_order_item_changes();

CREATE TRIGGER prevent_order_item_delete
  BEFORE DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_completed_order_item_changes();

-- ============================================================
-- TRIGGER: Update Order Total on Item Changes
-- ============================================================
-- Automatically recalculates order total when items are modified

CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  v_order_id UUID;
  v_new_total DECIMAL(10, 2);
BEGIN
  -- Get the order_id being affected
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);
  
  -- Calculate new total
  SELECT COALESCE(SUM(quantity * price_at_time), 0)
  INTO v_new_total
  FROM order_items
  WHERE order_id = v_order_id;
  
  -- Update the order total
  UPDATE orders
  SET total_amount = v_new_total
  WHERE id = v_order_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_inserted
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

CREATE TRIGGER on_order_item_updated
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

CREATE TRIGGER on_order_item_deleted
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION handle_order_created IS 
  'Automatically reserves stock when a new order is created';

COMMENT ON FUNCTION handle_order_stock_change IS 
  'Manages stock based on order status: releases on cancel, finalizes on packed';

COMMENT ON FUNCTION prevent_completed_order_item_changes IS 
  'Prevents modifications to order items after order is no longer pending';

COMMENT ON FUNCTION update_order_total IS 
  'Automatically recalculates order total when items change';
