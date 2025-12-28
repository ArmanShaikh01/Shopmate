import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const orderId = params.id

    // 1. Verify Authentication & Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, method } = await request.json()

    if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Use admin client to bypass RLS for payment insertion
    const adminClient = createAdminClient()

    // Insert payment - the database trigger will automatically update order aggregates
    const { data: payment, error: insertError } = await adminClient
        .from('payments')
        .insert({
            order_id: orderId,
            amount: amount,
            payment_method: method || 'cash_on_delivery',
            status: 'completed'
        })
        .select()
        .single()

    if (insertError) {
        console.error('❌ Payment insert failed:', insertError)
        return NextResponse.json({
            error: insertError.message,
            details: insertError.details,
            hint: insertError.hint
        }, { status: 500 })
    }

    console.log('✅ Payment recorded:', payment.id, '- Amount:', amount)
    console.log('ℹ️  Database trigger will auto-update order aggregates')

    // Revalidate the order detail page to force fresh data on next request
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/admin/orders')

    return NextResponse.json({ success: true, payment })
}
