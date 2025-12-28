import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = createClient()

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'You must be logged in to place an order.' }, { status: 401 })
    }

    const { items } = await request.json()

    // 2. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty or invalid.' }, { status: 400 })
    }

    try {
        // 3. Begin Transaction Logic
        // Calculate total in decimal (Rupees)
        const totalAmount = items.reduce((sum: number, i: any) => sum + (i.priceAtOrder * i.quantity), 0)

        // 15 minutes expiry as per schema comment
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        console.log(`[OrderAPI] Creating order for user ${user.id}...`)

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: user.id,
                status: 'pending',
                total_amount: totalAmount,
                expires_at: expiresAt,
                delivery_address: 'Shop Pickup', // Default for now
                delivery_phone: 'N/A' // Will be updated if profile exists
            })
            .select('id')
            .single()

        if (orderError || !order) {
            console.error('[OrderAPI] Order Creation Error:', orderError)
            throw new Error('Failed to create order record: ' + (orderError?.message || 'Unknown error'))
        }

        console.log(`[OrderAPI] Order created: ${order.id}. Inserting ${items.length} items...`)

        // Fetch current products to ensure prices are correct and they exist
        const productIds = items.map((i: any) => i.productId)
        const { data: dbProducts, error: dbProdError } = await supabase.from('products').select('id, name, price').in('id', productIds)

        if (dbProdError || !dbProducts || dbProducts.length !== items.length) {
            console.error('[OrderAPI] Product fetch error:', dbProdError)
            throw new Error('Some products in your cart are no longer available.')
        }

        // Insert Order Items
        const orderItems = items.map(item => {
            const dbProduct = dbProducts.find(p => p.id === item.productId)!
            return {
                order_id: order.id,
                product_id: dbProduct.id,
                price_at_time: dbProduct.price,
                quantity: item.quantity
            }
        })

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

        if (itemsError) {
            console.error('[OrderAPI] Items Insertion Error:', itemsError)
            // Cleanup order
            await supabase.from('orders').delete().eq('id', order.id)
            throw new Error('Failed to save order items.')
        }

        console.log(`[OrderAPI] Items inserted. Reserving stock...`)

        // 4. Reserve Stock via RPC (Order Level)
        const { data: isReserved, error: reserveError } = await supabase
            .rpc('reserve_stock_for_order', { p_order_id: order.id })

        if (reserveError || !isReserved) {
            console.error('[OrderAPI] Stock Reservation Error:', reserveError)
            // Items are automatically deleted due to CASCADE, but we should delete the order
            await supabase.from('orders').delete().eq('id', order.id)
            throw new Error(reserveError?.message || 'Insufficient stock for one or more items.')
        }

        console.log(`[OrderAPI] Success! Order ${order.id} complete.`)
        return NextResponse.json({ success: true, orderId: order.id })

    } catch (err: any) {
        console.error('[OrderAPI] Global Catch:', err)
        return NextResponse.json({
            error: err.message || 'Internal Server Error',
            details: err.toString(),
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 })
    }
}
