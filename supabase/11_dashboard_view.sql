-- ============================================================
-- SCHEMA FIX: ADD DUE_AMOUNT TO ORDERS
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS due_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (due_amount >= 0);

-- Update existing orders to have due_amount = total_amount
UPDATE orders SET due_amount = total_amount WHERE due_amount = 0 AND status != 'delivered';

-- ============================================================
-- UPDATED ADMIN DASHBOARD VIEW
-- ============================================================

DROP VIEW IF EXISTS daily_shop_summary;

CREATE OR REPLACE VIEW daily_shop_summary AS
SELECT 
    DATE(created_at) as day,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
    COUNT(*) FILTER (WHERE due_amount = 0 AND status != 'cancelled') as paid_orders,
    COUNT(*) FILTER (WHERE due_amount > 0 AND total_amount > due_amount AND status != 'cancelled') as partial_orders,
    COUNT(*) FILTER (WHERE due_amount = total_amount AND status != 'cancelled') as unpaid_orders,
    SUM(total_amount) FILTER (WHERE status != 'cancelled') as total_billed,
    SUM(due_amount) FILTER (WHERE status != 'cancelled') as total_due
FROM orders
GROUP BY DATE(created_at)
ORDER BY day DESC;
