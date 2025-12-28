import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Resend OTP by triggering a new signup (won't create duplicate user)
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Resend OTP error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
