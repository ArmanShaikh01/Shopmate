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

        // Get date from query params
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get('date')

        if (!date) {
            return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
        }

        // Fetch orders for the selected date
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                customer_id,
                profiles!orders_customer_id_fkey (
                    id,
                    full_name,
                    phone
                )
            `)
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
            .neq('status', 'cancelled')
            .order('created_at', { ascending: true })

        if (ordersError) {
            console.error('Orders fetch error:', ordersError)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({
                summary: {
                    totalOrders: 0,
                    totalAmount: 0,
                    totalCollected: 0,
                    totalPending: 0
                },
                orders: []
            })
        }

        // Fetch order items for all orders
        const orderIds = orders.map(o => o.id)
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                order_id,
                quantity,
                price_at_time,
                product_id,
                products (
                    name
                )
            `)
            .in('order_id', orderIds)

        if (itemsError) {
            console.error('Order items fetch error:', itemsError)
            return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 })
        }

        // Fetch payments for all orders
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('order_id, amount, status, payment_method, created_at')
            .in('order_id', orderIds)
            .eq('status', 'completed')

        if (paymentsError) {
            console.error('Payments fetch error:', paymentsError)
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
        }

        // Process orders with items and payments
        let totalAmount = 0
        let totalCollected = 0
        let totalPending = 0

        const processedOrders = orders.map(order => {
            const customer = order.profiles as any
            const items = (orderItems || [])
                .filter(item => item.order_id === order.id)
                .map(item => {
                    const product = item.products as any
                    return {
                        productName: product?.name || 'Unknown',
                        quantity: item.quantity,
                        unit: 'pc', // Default unit since products table doesn't have unit column
                        price: Number(item.price_at_time),
                        total: item.quantity * Number(item.price_at_time)
                    }
                })

            const orderPayments = (payments || []).filter(p => p.order_id === order.id)
            const paidAmount = orderPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            const orderTotal = Number(order.total_amount)
            const dueAmount = orderTotal - paidAmount

            const status = paidAmount === 0 ? 'unpaid' :
                paidAmount >= orderTotal ? 'paid' :
                    'partial'

            totalAmount += orderTotal
            totalCollected += paidAmount
            totalPending += dueAmount

            return {
                orderId: order.id,
                customerName: customer?.full_name || 'Unknown',
                customerPhone: customer?.phone || '',
                orderDate: order.created_at,
                items,
                totalAmount: orderTotal,
                paidAmount,
                dueAmount,
                status
            }
        })

        return NextResponse.json({
            summary: {
                totalOrders: orders.length,
                totalAmount,
                totalCollected,
                totalPending
            },
            orders: processedOrders
        })

    } catch (error) {
        console.error('Date-wise khata error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
