import { createClient } from '@supabase/supabase-js'

// ✅ DEFENSIVE: Validate environment variables are loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl) {
  console.error('❌ [SUPABASE] VITE_SUPABASE_URL not set in environment variables');
}
if (!supabaseAnonKey) {
  console.error('❌ [SUPABASE] VITE_SUPABASE_ANON_KEY not set in environment variables');
}

console.log('ℹ️ [SUPABASE] Initializing client with URL:', supabaseUrl?.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
