import { createClient } from '@supabase/supabase-js'

// Tambahkan "as string" di ujung agar TypeScript tenang
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
