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

        // Get customer ID from query params
        const searchParams = request.nextUrl.searchParams
        const customerId = searchParams.get('customerId')

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
        }

        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // Fetch all orders for this customer
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, created_at, total_amount, status')
            .eq('customer_id', customerId)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })

        if (ordersError) {
            console.error('Orders fetch error:', ordersError)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({
                customer: {
                    id: customer.id,
                    name: customer.full_name || 'Unknown',
                    phone: customer.phone || ''
                },
                summary: {
                    totalOrders: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    outstandingBalance: 0
                },
                orders: []
            })
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
            .select('order_id, amount, status, payment_method, created_at')
            .in('order_id', orderIds)

        if (paymentsError) {
            console.error('Payments fetch error:', paymentsError)
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
        }

        // Process orders
        let totalAmount = 0
        let totalPaid = 0

        const processedOrders = orders.map(order => {
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

            const orderPayments = (payments || [])
                .filter(p => p.order_id === order.id)
                .map(p => ({
                    date: p.created_at,
                    amount: Number(p.amount),
                    method: p.payment_method,
                    status: p.status
                }))

            const paidAmount = orderPayments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)

            const orderTotal = Number(order.total_amount)
            const dueAmount = orderTotal - paidAmount

            totalAmount += orderTotal
            totalPaid += paidAmount

            return {
                orderId: order.id,
                orderDate: order.created_at,
                items,
                totalAmount: orderTotal,
                payments: orderPayments.filter(p => p.status === 'completed'),
                paidAmount,
                dueAmount
            }
        })

        return NextResponse.json({
            customer: {
                id: customer.id,
                name: customer.full_name || 'Unknown',
                phone: customer.phone || ''
            },
            summary: {
                totalOrders: orders.length,
                totalAmount,
                totalPaid,
                outstandingBalance: totalAmount - totalPaid
            },
            orders: processedOrders
        })

    } catch (error) {
        console.error('Customer-wise khata error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
