/**
 * Client-side Supabase client utility
 * Following official Next.js 15 + Supabase SSR pattern
 * Use this in Client Components only
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
