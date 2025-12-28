# Supabase Setup Guide - Meri Dukan

Complete guide for setting up the Supabase backend for role-based access control.

## 📋 Prerequisites

1. Create a NEW Supabase project at https://supabase.com
2. Copy your project's:
   - Project URL
   - Anon (public) key
   - Service role key

## 🚀 Installation Steps

### Step 1: Execute SQL Files in Order

Open the Supabase SQL Editor and execute the files in this exact order:

1. **01_profiles_table.sql** - User profiles with role system
2. **02_products_table.sql** - Product catalog with stock management
3. **03_orders_tables.sql** - Orders and order items
4. **04_payments_table.sql** - Payment tracking
5. **05_reminders_table.sql** - Stock notification system
6. **06_stock_management.sql** - Stock reservation functions
7. **07_order_triggers.sql** - Order lifecycle automation
8. **08_expiry_handling.sql** - Order expiry system
9. **09_helper_functions.sql** - Utility functions

> [!IMPORTANT]
> Execute files sequentially. Each file depends on the previous ones.

### Step 2: Create Shopkeeper Account

#### Method 1: Via Supabase Dashboard

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **Invite User**
3. Enter email: `shopkeeper@example.com`
4. Set password or auto-generate
5. Copy the user's UUID
6. Open SQL Editor and run:

```sql
SELECT create_shopkeeper_profile(
  'USER-UUID-HERE'::UUID,
  'Shop Owner Name',
  '1234567890'
);
```

#### Method 2: Find User by Email

```sql
-- Get user ID
SELECT id FROM auth.users WHERE email = 'shopkeeper@example.com';

-- Elevate to shopkeeper
SELECT create_shopkeeper_profile(
  (SELECT id FROM auth.users WHERE email = 'shopkeeper@example.com'),
  'Shop Owner Name',
  '1234567890'
);
```

### Step 3: Verify Setup

Run the verification tests from **10_verification_tests.sql**:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected tables:
- ✅ `profiles`
- ✅ `products`
- ✅ `orders`
- ✅ `order_items`
- ✅ `payments`
- ✅ `reminders`

### Step 4: Update Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🔒 Security Architecture

### Role-Based Access Control

The system enforces separation at the **database level** using Row Level Security:

#### Customer Access
- ✅ Can view all active products
- ✅ Can create orders for themselves
- ✅ Can view only their own orders
- ✅ Can view only their own payments
- ❌ **CANNOT** access admin pages
- ❌ **CANNOT** view other customers' data
- ❌ **CANNOT** modify products

#### Shopkeeper Access
- ✅ Can view **ALL** products (including inactive)
- ✅ Can create/update/delete products
- ✅ Can view **ALL** orders from **ALL** customers
- ✅ Can update order status
- ✅ Can view **ALL** payments
- ✅ Can manage inventory

### Why /admin Routes Now Work

1. **Database-Level Blocking**: RLS policies prevent customers from querying admin data
2. **No Frontend Trust**: Even if a customer navigates to `/admin`, API calls fail at database level
3. **JWT Verification**: Supabase checks user's role on every query
4. **Single Source of Truth**: Role stored in `profiles` table, immutable from client

## 🧪 Testing Access Control

### Test as Customer

Login as a customer and try these queries:

```sql
-- Should return only customer's orders
SELECT * FROM orders;

-- Should FAIL with permission error
INSERT INTO products (name, price, stock_quantity)
VALUES ('Hack Attempt', 1.00, 1);
```

### Test as Shopkeeper

Login as shopkeeper and try:

```sql
-- Should return ALL orders
SELECT * FROM orders;

-- Should succeed
INSERT INTO products (name, price, stock_quantity)
VALUES ('New Product', 99.99, 50)
RETURNING *;
```

## 📦 Stock Management Flow

### Order Creation
1. Customer creates order with items
2. **Trigger**: Stock is automatically reserved
3. `products.reserved_quantity` increases
4. `products.available_quantity` decreases

### Order Cancellation
1. Customer or system cancels order
2. **Trigger**: Reserved stock is released
3. `products.reserved_quantity` decreases
4. `products.available_quantity` increases

### Order Packing
1. Shopkeeper marks order as "packed"
2. **Trigger**: Stock is permanently reduced
3. `products.stock_quantity` decreases
4. `products.reserved_quantity` decreases

### Concurrent Order Prevention
- Uses PostgreSQL row-level locks (`FOR UPDATE`)
- Prevents two customers from ordering the same last item
- Transaction-safe stock checks

## ⏰ Order Expiry Setup

Pending orders expire after 15 minutes. Set up automatic expiry:

### Option 1: Supabase pg_cron

```sql
SELECT cron.schedule(
  'expire-pending-orders',
  '* * * * *', -- Every minute
  $$ SELECT expire_pending_orders(); $$
);
```

### Option 2: Next.js API Route + External Cron

Create `src/app/api/cron/expire-orders/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('expire_pending_orders');
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ expired: data });
}
```

Schedule via:
- **Vercel Cron**: Add to `vercel.json`
- **GitHub Actions**: Scheduled workflow
- **External Service**: cron-job.org, EasyCron, etc.

### Option 3: Manual Execution

```sql
SELECT * FROM expire_pending_orders();
```

## 🔍 Debugging Role Issues

### Check User Role

```sql
-- Get current user's role
SELECT get_user_role();

-- Get full profile
SELECT * FROM get_current_user_profile();

-- Check if shopkeeper
SELECT is_shopkeeper();
```

### Check RLS Policy Execution

```sql
-- Enable RLS debugging (Supabase logs)
SET client_min_messages TO DEBUG;

-- Try query and check logs
SELECT * FROM orders;
```

### Verify User Authentication

```typescript
// In Next.js
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Check role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();
console.log('Role:', profile?.role);
```

## 📚 SQL Function Reference

| Function | Purpose | Access |
|----------|---------|--------|
| `reserve_stock_for_order()` | Reserve stock for pending order | Auto-triggered |
| `release_stock_for_order()` | Release reserved stock | Auto-triggered |
| `finalize_stock_for_order()` | Permanently reduce stock | Auto-triggered |
| `expire_pending_orders()` | Cancel expired orders | Cron job |
| `is_shopkeeper()` | Check if user is shopkeeper | Any user |
| `get_user_role()` | Get current user's role | Any user |
| `create_shopkeeper_profile()` | Elevate user to shopkeeper | Admin only |

## 🛡️ Security Best Practices

1. **Never expose service role key** to client-side code
2. **Always use RLS policies** - Don't trust client-side checks
3. **Rotate keys** if compromised
4. **Use environment-specific projects** (dev, staging, prod)
5. **Monitor auth logs** for suspicious activity
6. **Limit shopkeeper accounts** to trusted personnel only

## 🚨 Troubleshooting

### Issue: Customer can access admin data

**Solution**: Verify RLS policies are enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
All tables should have `rowsecurity = true`.

### Issue: Shopkeeper cannot create products

**Solution**: Check user's role in database:
```sql
SELECT id, role FROM profiles WHERE id = auth.uid();
```
Should return `role = 'shopkeeper'`.

### Issue: Stock reservations not working

**Solution**: Check triggers are active:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

### Issue: Orders not expiring

**Solution**: Manually run expiry function:
```sql
SELECT * FROM expire_pending_orders();
```
Then set up automated cron job.

## 📞 Next Steps

1. ✅ Execute all SQL files in order
2. ✅ Create shopkeeper account
3. ✅ Run verification tests
4. ✅ Update environment variables in Next.js
5. ✅ Set up order expiry cron job
6. ✅ Test role-based access from frontend
7. ✅ Deploy to production

---

**Questions or Issues?**
- Check Supabase logs in Dashboard > Database > Logs
- Review RLS policies in Dashboard > Database > Policies
- Verify user roles in Dashboard > Authentication > Users
