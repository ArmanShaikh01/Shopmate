import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient() {
  // Always use anon key for session-based authentication
  // Service role key bypasses cookies and sessions
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        get(name) {
          try {
            return cookies().get(name)?.value
          } catch {
            return undefined
          }
        },
        set(name, value, options) {
          try {
            cookies().set({ name, value, ...options })
          } catch {
            // Handle edge cases - cookies() might not be available in some contexts
          }
        },
        remove(name, options) {
          try {
            cookies().set({ name, value: '', ...options })
          } catch {
            // Handle edge cases - cookies() might not be available in some contexts
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
