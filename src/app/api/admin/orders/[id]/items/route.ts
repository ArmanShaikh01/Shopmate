import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PUT: Update Quantity
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const orderId = params.id

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { itemId, productId, oldQty, newQty } = await request.json()

    // Logic from previous action
    const diff = newQty - oldQty
    if (diff === 0) return NextResponse.json({ success: true })

    if (diff > 0) {
        // Reserve more
        const { data: success } = await supabase.rpc('reserve_stock', { p_product_id: productId, p_quantity: diff })
        if (!success) {
            return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
        }
    } else {
        // Release
        await supabase.rpc('release_stock', { p_product_id: productId, p_quantity: Math.abs(diff) })
    }

    // Calc line total (using correct decimal price)
    const { data: item } = await supabase.from('order_items').select('price_at_time').eq('id', itemId).single()

    if (item) {
        const { error } = await supabase
            .from('order_items')
            .update({
                quantity: newQty
            })
            .eq('id', itemId)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// DELETE: Remove Item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { itemId, productId, quantity } = await request.json()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Release stock
    await supabase.rpc('release_stock', {
        p_product_id: productId,
        p_quantity: quantity
    })

    // Delete item
    const { error } = await supabase.from('order_items').delete().eq('id', itemId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
