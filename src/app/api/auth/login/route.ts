// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create both clients; prefer the service-role client for privileged operations.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)

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

    let emailToUse: string

    // Check if identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
    if (isEmail) {
      emailToUse = raw.toLowerCase()
    } else {
      // Assume it's a username; fetch associated email from profiles table
      // Assuming you have a 'profiles' table with columns: id (uuid referencing auth.users.id), username (text, unique)
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', raw)
        .single()

      if (error || !data) {
        console.warn('[auth/login] Username not found', { username: raw, error: error?.message })
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Get user email via admin API (requires service role)
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.id)

      if (userError || !userData?.user?.email) {
        console.warn('[auth/login] Failed to fetch user email', { userId: data.id, error: userError?.message })
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      emailToUse = userData.user.email
    }

    // Use the anon client for sign-in to mimic normal client behavior
    const { data, error: signInError } = await supabaseAnon.auth.signInWithPassword({
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