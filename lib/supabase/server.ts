import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client — solo para uso en server (bot, API routes que necesitan bypass RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
