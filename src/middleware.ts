import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    // Skip auth check for API routes
    if (url.pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // Public paths that don't require auth
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/privacy-policy', '/']
    const isPublicPath = publicPaths.some(path => url.pathname === path || url.pathname.startsWith(path + '/'))

    // Skip auth check for public paths
    if (isPublicPath) {
        return NextResponse.next()
    }

    // Create Supabase client
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
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

    // Admin routes require shopkeeper role
    if (url.pathname.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        if (!user.email_confirmed_at) {
            url.pathname = '/verify-email'
            url.searchParams.set('email', user.email || '')
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'shopkeeper') {
            url.pathname = '/shop'
            return NextResponse.redirect(url)
        }
    }

    // Shop routes require authenticated user
    if (url.pathname.startsWith('/shop')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

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
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
