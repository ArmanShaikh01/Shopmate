const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'orders' })

    // If that RPC doesn't exist (likely), use a query
    const { data: columns, error: cError } = await supabase
        .from('orders')
        .select('*')
        .limit(1)

    if (cError) {
        console.error(cError)
    } else {
        console.log('Columns in orders table:', Object.keys(columns[0] || {}))
    }
}

inspect()
