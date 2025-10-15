/**
 * Unit tests for create-profile route
 */

let mockSupabaseClient: any = null

jest.mock('@supabase/supabase-js', () => ({
  createClient: (_url: string, _key: string) => {
    if (!mockSupabaseClient) throw new Error('mockClient not configured')
    return mockSupabaseClient
  }
}))

describe('create-profile POST', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('returns 409 when duplicate username detected', async () => {
    mockSupabaseClient = {
      from: (_table: string) => ({
        insert: (_arr: any[]) => Promise.resolve({ data: null, error: { message: 'duplicate key value violates unique constraint "profiles_username_unique"' } })
      })
    }

    const route = await import('../../src/app/api/create-profile/route')

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ id: 'user-123', email: 'u@example.com', username: 'Dupe' }) })
    const res: any = await route.POST(req)
    expect(res.status).toBe(409)
    const payload = await res.json()
    expect(payload).toHaveProperty('error', 'Username is already taken')
  })

  it('inserts profile and returns profile when successful (stores lowercase username)', async () => {
    const inserted = { user_id: 'user-321', email: 'u2@example.com', username: 'lowercase' }
    mockSupabaseClient = {
      from: (_table: string) => ({
        insert: (_arr: any[]) => Promise.resolve({ data: [inserted], error: null })
      })
    }

    const route = await import('../../src/app/api/create-profile/route')

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ id: 'user-321', email: 'u2@example.com', username: 'LOWERCASE' }) })
    const res: any = await route.POST(req)
    expect(res.status).toBe(200)
    const payload = await res.json()
    expect(payload).toHaveProperty('profile')
    expect(payload.profile).toHaveProperty('username', 'lowercase')
  })
})
