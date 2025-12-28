import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient() {
  const isServer = typeof window === 'undefined'

  // Use Service Role Key on server-side to bypass RLS for internal logic (Role checks, etc)
  const supabaseKey = isServer
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookies().get(name)?.value
        },
        set(name, value, options) {
          try {
            cookies().set({ name, value, ...options })
          } catch (error) {
            // Handle edge cases
          }
        },
        remove(name, options) {
          try {
            cookies().set({ name, value: '', ...options })
          } catch (error) {
            // Handle edge cases
          }
        },
      },
    }
  )
}

// Admin client that bypasses ALL RLS (no cookies, pure service role)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
