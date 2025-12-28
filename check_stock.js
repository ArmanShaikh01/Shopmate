const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- PRODUCTS STOCK ---')
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, reserved_quantity, is_active')

    if (pError) console.error(pError)
    else console.table(products.map(p => ({ ...p, available: p.stock_quantity - p.reserved_quantity })))

    console.log('\n--- PENDING ORDERS ---')
    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('status', 'pending')

    if (oError) console.error(oError)
    else console.table(orders)
}

check()
