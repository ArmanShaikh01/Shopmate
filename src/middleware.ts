import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create a Supabase client to interact with the auth
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // Allow API routes
    if (url.pathname.startsWith('/api/')) {
        return supabaseResponse
    }

    // Public paths that don't require auth
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/privacy-policy', '/']
    const isPublicPath = publicPaths.some(path => url.pathname === path || url.pathname.startsWith(path + '/'))

    // Rule 1: Check if user exists but email NOT confirmed
    if (user && !user.email_confirmed_at) {
        // If trying to access protected route, redirect to verify-email
        if (!isPublicPath && !url.pathname.startsWith('/verify-email')) {
            url.pathname = '/verify-email'
            url.searchParams.set('email', user.email || '')
            return NextResponse.redirect(url)
        }
        // Allow verify-email page
        return supabaseResponse
    }

    // Rule 2: /admin and /shop requests require verified email
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/shop')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        // Double-check email is confirmed
        if (!user.email_confirmed_at) {
            url.pathname = '/verify-email'
            url.searchParams.set('email', user.email || '')
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
