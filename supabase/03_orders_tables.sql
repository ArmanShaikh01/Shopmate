-- ============================================================
-- ORDERS AND ORDER_ITEMS TABLES - Order Management System
-- ============================================================
-- Complete order lifecycle with automatic expiry handling

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',    -- Order created, awaiting confirmation
  'confirmed',  -- Order confirmed by shopkeeper
  'packed',     -- Order packed and ready for delivery
  'delivered',  -- Order delivered to customer
  'cancelled'   -- Order cancelled (by customer or expired)
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  notes TEXT,
  
  -- Expiry tracking
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  packed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- ============================================================
-- ORDER_ITEMS TABLE
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate products in same order
  UNIQUE(order_id, product_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_expires_at ON orders(expires_at) WHERE status = 'pending';
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================================

CREATE TRIGGER on_order_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- STATUS TIMESTAMP TRIGGERS
-- ============================================================
-- Automatically set timestamp fields when status changes

CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Set appropriate timestamp based on status transition
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = NOW();
  END IF;
  
  IF NEW.status = 'packed' AND OLD.status != 'packed' THEN
    NEW.packed_at = NOW();
  END IF;
  
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = NOW();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  -- Prevent status changes on already completed orders
  IF OLD.status IN ('delivered', 'cancelled') AND NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Cannot change status of completed order';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_status_updated
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES - ORDERS
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Policy 2: Customers can create their own orders
CREATE POLICY "Customers can create own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Policy 3: Customers can update their own pending orders
CREATE POLICY "Customers can update own pending orders"
  ON orders
  FOR UPDATE
  USING (
    auth.uid() = customer_id 
    AND status = 'pending'
  );

-- Policy 4: Shopkeepers can view all orders
CREATE POLICY "Shopkeepers can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 5: Shopkeepers can update any order
CREATE POLICY "Shopkeepers can update all orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- ============================================================
-- ROW LEVEL SECURITY POLICIES - ORDER_ITEMS
-- ============================================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view items from their own orders
CREATE POLICY "Customers can view own order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Policy 2: Customers can insert items to their own pending orders
CREATE POLICY "Customers can add items to own orders"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'pending'
    )
  );

-- Policy 3: Shopkeepers can view all order items
CREATE POLICY "Shopkeepers can view all order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 4: Shopkeepers can modify order items
CREATE POLICY "Shopkeepers can modify order items"
  ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE orders IS 'Customer orders with automatic expiry after 15 minutes';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON COLUMN orders.expires_at IS 'Pending orders auto-cancel after this timestamp';
COMMENT ON COLUMN order_items.price_at_time IS 'Product price when order was created (historical record)';
