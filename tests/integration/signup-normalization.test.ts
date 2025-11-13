/**
 * Integration-style test: simulate signup flow normalization across username-available and create-profile routes
 */

let mockSignupClient: any = null

jest.mock('@supabase/supabase-js', () => ({
  createClient: (_url: string, _key: string) => {
    if (!mockSignupClient) throw new Error('mockClient not configured')
    return mockSignupClient
  }
}))

describe('signup normalization integration', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('checks availability and then creates profile storing lowercase username', async () => {
    // Step 1: availability check - no existing profile
    mockSignupClient = {
      from: (_table: string) => ({
        select: (_sel: string) => ({
          ilike: (_col: string, val: string) => ({
            limit: (_n: number) => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: (_arr: any[]) => Promise.resolve({ data: [{ user_id: 'u-x', email: 'x@x.com', username: 'lowercase' }], error: null })
      })
    }

    const availRoute = await import('../../src/app/api/username-available/route')
    const createRoute = await import('../../src/app/api/create-profile/route')

    // availability with mixed-case username
    const req1 = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ username: 'MiXeDCase' }) })
    const res1: any = await availRoute.POST(req1)
    const p1 = await res1.json()
    expect(p1.available).toBe(true)

    // create-profile should store lowercase
    const req2 = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ id: 'u-x', email: 'x@x.com', username: 'MiXeDCase' }) })
    const res2: any = await createRoute.POST(req2)
    expect(res2.status).toBe(200)
    const p2 = await res2.json()
    expect(p2.profile).toHaveProperty('username', 'lowercase')
  })
})
