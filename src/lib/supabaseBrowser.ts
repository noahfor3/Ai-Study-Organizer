"use client"

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null

// Only create the client in the browser. This file can be imported from
// server components during SSR which would otherwise cause the client to
// attempt to initialize with missing env vars and crash.
if (typeof window !== 'undefined') {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } else {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
}

export default supabase
