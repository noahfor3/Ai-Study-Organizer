/**
 * E2E test: start the real Express server and perform basic health checks
 */

describe('E2E: start server and check health endpoints', () => {
  let server: any
    let request: any

  beforeAll(() => {
    process.env.PORT = '0'
    // start server after setting env
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createApp } = require('../../src/app')
    const app = createApp()
    const supertest = require('supertest')
    request = supertest(app)
  })

  it('responds to /health', async () => {
    const res = await request.get('/health').expect(200)
    expect(res.body).toHaveProperty('status', 'healthy')
  })

  it('responds to /api/summarize/health', async () => {
    const res = await request.get('/api/summarize/health').expect(200)
    expect(res.body).toHaveProperty('status', 'healthy')
  })
})
