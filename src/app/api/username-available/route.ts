import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import logger from '../../../lib/logger'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create both clients; prefer the service-role client for privileged reads.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabase = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : supabaseAnon

type ReqBody = { username?: string }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody
    const raw = (body.username || '').trim()

    if (!raw) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    }

    // normalize to lowercase for consistent comparisons
    const username = raw.toLowerCase()

    // basic validation
    if (username.length < 3 || username.length > 32) {
      return NextResponse.json({ error: 'Username must be between 3 and 32 characters' }, { status: 400 })
    }

    // check profiles (case-insensitive match to align with DB uniqueness)
    logger.log('[username-available] using', SERVICE_ROLE_KEY ? 'service-role' : 'anon', 'client')
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      // use ilike on normalized username; server stores lowercase so this matches
      .ilike('username', username)
      .limit(1)

    if (profileError) {
      logger.warn('[username-available] profiles query failed', profileError)
      return NextResponse.json({ error: 'Failed to check username availability' }, { status: 500 })
    }

    // Defensive: ensure we got an array back
    logger.log('[username-available] lookup', { username, profileRows })

    if (Array.isArray(profileRows) && profileRows.length > 0) {
      return NextResponse.json({ available: false })
    }

    // not found in profiles
    return NextResponse.json({ available: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected server error' }, { status: 500 })
  }
}
