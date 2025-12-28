import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, token } = await request.json()

        if (!email || !token) {
            return NextResponse.json(
                { error: 'Email and OTP code required' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Verify the OTP
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        if (!data.user) {
            return NextResponse.json(
                { error: 'Verification failed' },
                { status: 400 }
            )
        }

        // Update profile with user metadata using admin client
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const fullName = data.user.user_metadata?.full_name
        const phone = data.user.user_metadata?.phone

        if (fullName && phone) {
            await admin
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone
                })
                .eq('id', data.user.id)
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('OTP verification error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
