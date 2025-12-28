-- ============================================================
-- CLEANUP: Reset and Recalculate Reserved Quantities
-- ============================================================
-- Run this if stock seems out of sync or "Insufficient stock" 
-- errors occur despite available quantity.

BEGIN;

-- 1. Reset all reserved quantities to 0
UPDATE products SET reserved_quantity = 0;

-- 2. Recalculate based on existing PENDING orders
UPDATE products p
SET reserved_quantity = subquery.total_reserved
FROM (
  SELECT product_id, SUM(quantity) as total_reserved
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'pending'
  GROUP BY product_id
) AS subquery
WHERE p.id = subquery.product_id;

-- 3. Confirm results
SELECT name, stock_quantity, reserved_quantity, (stock_quantity - reserved_quantity) as available
FROM products
WHERE reserved_quantity > 0;

COMMIT;

-- 4. Drop the redundant/broken trigger
DROP TRIGGER IF EXISTS on_order_created ON orders;
