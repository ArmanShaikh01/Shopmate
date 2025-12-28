import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const orderId = params.id

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { newStatus } = await request.json()

    // Logic from previous action
    const { data: order } = await supabase.from('orders').select('status').eq('id', orderId).single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status === 'cancelled') return NextResponse.json({ error: 'Cannot change status of cancelled order' }, { status: 400 })

    // Database triggers in 07_order_triggers.sql handle:
    // - status='packed' -> finalize_stock_for_order (permanent reduction)
    // - status='cancelled' -> release_stock_for_order (return reserved stock)

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
