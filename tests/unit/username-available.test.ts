/**
 * Unit tests for the username-available route
 */

let mockUsernameClient: any = null

jest.mock('@supabase/supabase-js', () => ({
  createClient: (_url: string, _Key: string) => {
    if (!mockUsernameClient) throw new Error('mockClient not configured')
    return mockUsernameClient
  }
}))

describe('username-available POST', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('returns available: false when profile exists (normalizes to lowercase)', async () => {
    // configure mock to return a row when ilike receives lowercase 'taken'
    mockUsernameClient = {
      from: (_table: string) => ({
        select: (_sel: string) => ({
          ilike: (_col: string, val: string) => ({
            limit: (_n: number) => Promise.resolve({ data: val === 'taken' ? [{ username: 'taken' }] : [], error: null })
          })
        })
      })
    }

    // import the route after mocking
    const route = await import('../../src/app/api/username-available/route')

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ username: 'TaKeN' }) })
    const res: any = await route.POST(req)
    const payload = await res.json()

    expect(payload).toHaveProperty('available', false)
  })

  it('returns available: true when no profile exists (normalizes to lowercase)', async () => {
    mockUsernameClient = {
      from: (_table: string) => ({
        select: (_sel: string) => ({
          ilike: (_col: string, _val: string) => ({
            limit: (_n: number) => Promise.resolve({ data: [], error: null })
          })
        })
      })
    }

    const route = await import('../../src/app/api/username-available/route')

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ username: 'UniqueName' }) })
    const res: any = await route.POST(req)
    const payload = await res.json()

    expect(payload).toHaveProperty('available', true)
  })
})
