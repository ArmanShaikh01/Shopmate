-- ============================================================
-- PAYMENTS TABLE - Payment Tracking System
-- ============================================================
-- Manages payment records for orders

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'upi');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- UPI-specific fields
  upi_transaction_id TEXT,
  upi_reference_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT check_upi_fields CHECK (
    (payment_method = 'upi' AND upi_transaction_id IS NOT NULL) OR
    (payment_method = 'cash_on_delivery')
  )
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(payment_method);

-- ============================================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================================

CREATE TRIGGER on_payment_updated
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- PAYMENT STATUS TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when payment is marked as completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_status_updated
  BEFORE UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_status_change();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view payments for their own orders
CREATE POLICY "Customers can view own payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Policy 2: Customers can create payments for their own orders
CREATE POLICY "Customers can create payments for own orders"
  ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Policy 3: Shopkeepers can view all payments
CREATE POLICY "Shopkeepers can view all payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'shopkeeper'
    )
  );

-- Policy 4: Shopkeepers can update payment status
CREATE POLICY "Shopkeepers can update payments"
  ON payments
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

COMMENT ON TABLE payments IS 'Payment records for orders';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: cash_on_delivery or upi';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, completed, or failed';
COMMENT ON COLUMN payments.upi_transaction_id IS 'UPI transaction ID (required for UPI payments)';
