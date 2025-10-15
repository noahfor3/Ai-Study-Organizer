import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use the service role key on the server to perform privileged inserts.
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

type ReqBody = {
  id?: string
  email?: string
  username?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody
    // Expect the auth user id (user_id) to be provided. Option B uses auth.users.id
  const userId = (body.id || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  // normalize username to lowercase for consistent storage and comparisons
  const username = (body.username || '').trim().toLowerCase()

    if (!userId) {
      return NextResponse.json({ error: 'Missing auth user id (user_id) — cannot create profile without linking to auth.users' }, { status: 400 })
    }

    if (!email || !username) {
      return NextResponse.json({ error: 'Missing email or username' }, { status: 400 })
    }

    // Basic validation: username length
    if (username.length < 3 || username.length > 32) {
      return NextResponse.json({ error: 'Username must be between 3 and 32 characters' }, { status: 400 })
    }

    // Insert profile using user_id as primary key (Option B schema).
    // We store username normalized to lowercase for consistent comparisons.
    const { data, error } = await supabase.from('profiles').insert([
      { user_id: userId, email, username }
    ])

    if (error) {
      const e: any = error
      const msg = e?.message || 'Failed to create profile'

      // detect postgres unique constraint violation on username
      // Supabase may return messages like "duplicate key value violates unique constraint \"profiles_username_unique\""
      if (msg && msg.toLowerCase().includes('duplicate key')) {
        // Prefer a 409 Conflict for duplicate username/email
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
      }

      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ profile: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected server error' }, { status: 500 })
  }
}
