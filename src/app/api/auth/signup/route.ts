import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const { email, password, fullName, phone } = await request.json()

        // Validate inputs
        if (!email || !password || !fullName || !phone) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Create admin client
        const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Create user with auto-confirmed email
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                phone: phone,
                role: 'customer' // Store role in metadata for instant access
            }
        })

        if (authError) {
            return NextResponse.json(
                { success: false, error: authError.message },
                { status: 400 }
            )
        }

        const user = authData.user
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Signup failed' },
                { status: 500 }
            )
        }

        // Update profile with user details
        await admin
            .from('profiles')
            .update({
                full_name: fullName,
                phone: phone,
                role: 'customer'
            })
            .eq('id', user.id)

        return NextResponse.json({
            success: true,
            userId: user.id
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
