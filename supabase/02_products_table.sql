-- ============================================================
-- PRODUCTS TABLE - Inventory Management with Stock Control
-- ============================================================
-- Manages product catalog with real-time stock tracking
-- Supports temporary reservations and permanent stock reduction

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_shopkeeper UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: reserved cannot exceed total stock
  CONSTRAINT check_reserved_quantity CHECK (reserved_quantity <= stock_quantity)
);

-- ============================================================
-- COMPUTED COLUMN - Available Quantity
-- ============================================================
-- Virtual column that shows actual available stock
-- available = total stock - reserved stock

CREATE OR REPLACE FUNCTION get_available_quantity(product_id UUID)
RETURNS INTEGER AS $$
  SELECT stock_quantity - reserved_quantity
  FROM products
  WHERE id = product_id;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_shopkeeper ON products(created_by_shopkeeper);

-- ============================================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================================

CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view active products (for browsing)
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Policy 2: Shopkeepers can view all products (including inactive)
CREATE POLICY "Shopkeepers can view all products"
  ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 3: Only shopkeepers can insert products
CREATE POLICY "Only shopkeepers can create products"
  ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 4: Only shopkeepers can update products
CREATE POLICY "Only shopkeepers can update products"
  ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 5: Only shopkeepers can delete products
CREATE POLICY "Only shopkeepers can delete products"
  ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE products IS 'Product catalog with stock management and reservation system';
COMMENT ON COLUMN products.stock_quantity IS 'Total stock available in inventory';
COMMENT ON COLUMN products.reserved_quantity IS 'Stock temporarily reserved for pending orders';
COMMENT ON COLUMN products.is_active IS 'Whether product is visible to customers';
