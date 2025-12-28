'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData): Promise<void> {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const target = (formData.get('target') as string) || ''

    // 1. Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError) throw new Error(authError.message)

    const user = authData.user
    if (!user) throw new Error('Sign in failed.')

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
        redirect(`/verify-email?email=${encodeURIComponent(email)}`)
    }

    // 2. Fetch role using EXPLICIT ADMIN CLIENT (Fast & Reliable)
    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'customer'

    // 3. Simple Redirection (No heavy revalidatePath)
    if (role === 'shopkeeper') {
        redirect('/admin/dashboard')
    } else {
        if (target === 'admin') {
            redirect('/login?error=unauthorized')
        } else {
            redirect('/shop')
        }
    }
}

export async function signup(formData: FormData): Promise<void> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const role = 'customer' // Always customer for public signup

    // Validate inputs
    if (!email || !password || !fullName || !phone) {
        redirect(`/signup?error=${encodeURIComponent('All fields are required')}`)
    }

    if (password.length < 8) {
        redirect(`/signup?error=${encodeURIComponent('Password must be at least 8 characters')}`)
    }

    // TEMPORARY: Use admin client to create user with auto-confirmed email
    // TODO: Re-enable OTP verification when SMTP is fixed
    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for development
        user_metadata: {
            full_name: fullName,
            phone: phone
        }
    })

    if (authError) {
        redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
    }

    const user = authData.user
    if (!user) {
        redirect(`/signup?error=${encodeURIComponent('Signup failed')}`)
    }

    // Update profile with user details
    await admin
        .from('profiles')
        .update({
            full_name: fullName,
            phone: phone,
            role: role
        })
        .eq('id', user.id)

    // Auto-login the user
    const supabase = createClient()
    await supabase.auth.signInWithPassword({ email, password })

    // Redirect to shop
    redirect('/shop')

}

export async function forgotPassword(formData: FormData): Promise<void> {
    const supabase = createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect(`/forgot-password?error=${encodeURIComponent('Email is required')}`)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
        redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/forgot-password?success=true')
}

export async function resetPassword(formData: FormData): Promise<void> {
    const supabase = createClient()
    const password = formData.get('password') as string

    if (!password || password.length < 8) {
        redirect(`/reset-password?error=${encodeURIComponent('Password must be at least 8 characters')}`)
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?success=password-reset')
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
