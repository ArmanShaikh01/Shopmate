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

        // Fetch all orders with dues
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
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })

        if (ordersError) {
            console.error('Orders fetch error:', ordersError)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json([])
        }

        // Fetch order items
        const orderIds = orders.map(o => o.id)
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                order_id,
                quantity,
                price_at_time,
                products (
                    name
                )
            `)
            .in('order_id', orderIds)

        if (itemsError) {
            console.error('Order items fetch error:', itemsError)
            return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 })
        }

        // Fetch payments
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('order_id, amount, status')
            .in('order_id', orderIds)
            .eq('status', 'completed')

        if (paymentsError) {
            console.error('Payments fetch error:', paymentsError)
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
        }

        // Group by customer and calculate dues
        const customerMap = new Map<string, {
            customerId: string
            customerName: string
            customerPhone: string
            totalDue: number
            orders: Array<{
                orderId: string
                orderDate: string
                items: Array<{ productName: string; quantity: number; price: number; total: number }>
                totalAmount: number
                paidAmount: number
                dueAmount: number
                status: string
            }>
        }>()

        orders.forEach(order => {
            const customer = order.profiles as any
            if (!customer) return

            const customerId = customer.id
            const orderPayments = (payments || []).filter(p => p.order_id === order.id)
            const paidAmount = orderPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            const orderTotal = Number(order.total_amount)
            const dueAmount = orderTotal - paidAmount

            // Only include orders with pending dues
            if (dueAmount <= 0) return

            const status = paidAmount === 0 ? 'unpaid' : 'partial'

            const items = (orderItems || [])
                .filter(item => item.order_id === order.id)
                .map(item => {
                    const product = item.products as any
                    return {
                        productName: product?.name || 'Unknown',
                        quantity: item.quantity,
                        price: Number(item.price_at_time),
                        total: item.quantity * Number(item.price_at_time)
                    }
                })

            if (!customerMap.has(customerId)) {
                customerMap.set(customerId, {
                    customerId,
                    customerName: customer.full_name || 'Unknown',
                    customerPhone: customer.phone || '',
                    totalDue: 0,
                    orders: []
                })
            }

            const customerData = customerMap.get(customerId)!
            customerData.totalDue += dueAmount
            customerData.orders.push({
                orderId: order.id,
                orderDate: order.created_at,
                items,
                totalAmount: orderTotal,
                paidAmount,
                dueAmount,
                status
            })
        })

        // Convert to array and sort by total due descending
        const result = Array.from(customerMap.values())
            .sort((a, b) => b.totalDue - a.totalDue)

        return NextResponse.json(result)

    } catch (error) {
        console.error('Outstanding dues error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
