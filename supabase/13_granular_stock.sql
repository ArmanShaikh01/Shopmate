-- ============================================================
-- GRANULAR STOCK MANAGEMENT UTILITIES
-- ============================================================

-- Function: Reserve Stock for Product
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Lock the product
  SELECT stock_quantity - reserved_quantity INTO v_available
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF v_available < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE products
  SET reserved_quantity = reserved_quantity + p_quantity
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Release Stock for Product
CREATE OR REPLACE FUNCTION release_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
