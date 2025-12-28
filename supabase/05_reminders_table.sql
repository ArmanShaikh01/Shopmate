-- ============================================================
-- REMINDERS TABLE - Out-of-Stock Notification System
-- ============================================================
-- Allows customers to request notifications when products
-- are back in stock

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  is_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  
  -- Prevent duplicate reminders for same customer-product combination
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_reminders_customer ON reminders(customer_id);
CREATE INDEX idx_reminders_product ON reminders(product_id);
CREATE INDEX idx_reminders_not_notified ON reminders(product_id) 
  WHERE is_notified = false;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view their own reminders
CREATE POLICY "Customers can view own reminders"
  ON reminders
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Policy 2: Customers can create their own reminders
CREATE POLICY "Customers can create own reminders"
  ON reminders
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Policy 3: Customers can delete their own reminders
CREATE POLICY "Customers can delete own reminders"
  ON reminders
  FOR DELETE
  USING (auth.uid() = customer_id);

-- Policy 4: Shopkeepers can view all reminders
CREATE POLICY "Shopkeepers can view all reminders"
  ON reminders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 5: Shopkeepers can update reminder status (mark as notified)
CREATE POLICY "Shopkeepers can update reminders"
  ON reminders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- ============================================================
-- AUTO-NOTIFICATION TRIGGER
-- ============================================================
-- When a product's stock is increased, check if there are
-- pending reminders and mark them for notification

CREATE OR REPLACE FUNCTION check_reminder_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock increased and available quantity is now sufficient
  IF NEW.stock_quantity > OLD.stock_quantity THEN
    UPDATE reminders
    SET is_notified = true,
        notified_at = NOW()
    WHERE product_id = NEW.id
      AND is_notified = false
      AND quantity <= (NEW.stock_quantity - NEW.reserved_quantity);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_stock_updated
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  WHEN (NEW.stock_quantity > OLD.stock_quantity)
  EXECUTE FUNCTION check_reminder_notifications();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE reminders IS 'Customer notifications for out-of-stock products';
COMMENT ON COLUMN reminders.is_notified IS 'Whether customer has been notified about stock availability';
COMMENT ON COLUMN reminders.quantity IS 'Quantity customer wants to purchase';
