import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = createClient()

        // Verify admin access
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'shopkeeper') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch all customers who have placed orders
        const { data: customers, error: customersError } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('role', 'customer')
            .order('full_name')

        if (customersError) {
            console.error('Customers fetch error:', customersError)
            return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
        }

        // Filter customers who have at least one order
        const { data: ordersCheck } = await supabase
            .from('orders')
            .select('customer_id')
            .neq('status', 'cancelled')

        const customerIdsWithOrders = new Set(ordersCheck?.map(o => o.customer_id) || [])

        const customersWithOrders = (customers || [])
            .filter(c => customerIdsWithOrders.has(c.id))
            .map(c => ({
                id: c.id,
                name: c.full_name || 'Unknown',
                phone: c.phone || ''
            }))

        return NextResponse.json(customersWithOrders)

    } catch (error) {
        console.error('Customers list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
