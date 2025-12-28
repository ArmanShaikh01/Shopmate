-- ============================================================
-- SCHEMA UPDATE: PAYMENT TRACKING AGGREGATES
-- ============================================================

-- 1. Create Payment Status Enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_payment_status') THEN
        CREATE TYPE order_payment_status AS ENUM ('unpaid', 'partial', 'paid');
    END IF;
END$$;

-- 2. Add columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
ADD COLUMN IF NOT EXISTS due_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (due_amount >= 0),
ADD COLUMN IF NOT EXISTS payment_status order_payment_status NOT NULL DEFAULT 'unpaid';

-- 3. Function to update order payment totals
CREATE OR REPLACE FUNCTION update_order_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
    v_total_paid DECIMAL(10, 2);
    v_order_total DECIMAL(10, 2);
BEGIN
    -- Get the order_id affected
    v_order_id := COALESCE(NEW.order_id, OLD.order_id);
    
    -- Calculate total paid for this order
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE order_id = v_order_id AND status = 'completed';
    
    -- Get order's total amount
    SELECT total_amount INTO v_order_total
    FROM orders
    WHERE id = v_order_id;
    
    -- Update the order
    UPDATE orders
    SET 
        paid_amount = v_total_paid,
        due_amount = GREATEST(0, v_order_total - v_total_paid),
        payment_status = CASE 
            WHEN v_total_paid >= v_order_total THEN 'paid'::order_payment_status
            WHEN v_total_paid > 0 THEN 'partial'::order_payment_status
            ELSE 'unpaid'::order_payment_status
        END,
        updated_at = NOW()
    WHERE id = v_order_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on payments table
DROP TRIGGER IF EXISTS on_payment_change ON payments;
CREATE TRIGGER on_payment_change
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_order_payment_totals();

-- 5. Initialize existing orders
UPDATE orders o
SET 
    paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = o.id AND status = 'completed'),
    due_amount = total_amount - (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = o.id AND status = 'completed'),
    payment_status = CASE 
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = o.id AND status = 'completed') >= o.total_amount THEN 'paid'::order_payment_status
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = o.id AND status = 'completed') > 0 THEN 'partial'::order_payment_status
        ELSE 'unpaid'::order_payment_status
    END;
