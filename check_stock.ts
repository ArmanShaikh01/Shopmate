import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- PRODUCTS STOCK ---')
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, reserved_quantity')

    if (pError) console.error(pError)
    else console.table(products?.map(p => ({ ...p, available: p.stock_quantity - p.reserved_quantity })))

    console.log('\n--- PENDING ORDERS ---')
    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('status', 'pending')

    if (oError) console.error(oError)
    else console.table(orders)

    console.log('\n--- RECENT ORDER ITEMS ---')
    const { data: items, error: iError } = await supabase
        .from('order_items')
        .select('order_id, product_id, quantity')
        .order('created_at', { ascending: false })
        .limit(10)

    if (iError) console.error(iError)
    else console.table(items)
}

check()
