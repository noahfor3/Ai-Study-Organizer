import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create both clients; prefer the service-role client for privileged reads.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabase = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : supabaseAnon

type ReqBody = {
  identifier?: string
  password?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody
    const raw = (body.identifier || '').trim()
    const password = body.password || ''

    if (!raw || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Enforce email-only login. Validate and normalize to lowercase.
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
    if (!isEmail) {
      return NextResponse.json({ error: 'Please sign in with your email address' }, { status: 400 })
    }

    const emailToUse = raw.toLowerCase()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    })

    if (signInError) {
      console.warn('[auth/login] signInWithPassword failed', { email: emailToUse, signInError: signInError.message ?? signInError })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ user: data.user ?? null, session: data.session ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected server error' }, { status: 500 })
  }
}
