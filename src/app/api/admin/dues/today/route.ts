import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

        // Get today's date range
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Fetch today's orders with dues
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                customer_id,
                profiles!orders_customer_id_fkey (
                    id,
                    full_name,
                    phone
                )
            `)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })

        if (ordersError) {
            console.error('Orders fetch error:', ordersError)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json([])
        }

        // Fetch payments for these orders
        const orderIds = orders.map(o => o.id)
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('order_id, amount, status')
            .in('order_id', orderIds)
            .eq('status', 'completed')

        if (paymentsError) {
            console.error('Payments fetch error:', paymentsError)
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
        }

        // Process orders and filter only those with dues
        const dueOrders = orders
            .map(order => {
                const customer = order.profiles as any
                const orderPayments = (payments || []).filter(p => p.order_id === order.id)
                const paidAmount = orderPayments.reduce((sum, p) => sum + Number(p.amount), 0)
                const orderTotal = Number(order.total_amount)
                const dueAmount = orderTotal - paidAmount

                const status = paidAmount === 0 ? 'unpaid' :
                    paidAmount >= orderTotal ? 'paid' :
                        'partial'

                return {
                    orderId: order.id,
                    orderDate: order.created_at,
                    customerName: customer?.full_name || 'Unknown',
                    customerPhone: customer?.phone || '',
                    totalAmount: orderTotal,
                    paidAmount,
                    dueAmount,
                    status
                }
            })
            .filter(order => order.dueAmount > 0) // Only orders with pending dues

        return NextResponse.json(dueOrders)

    } catch (error) {
        console.error('Due today error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
