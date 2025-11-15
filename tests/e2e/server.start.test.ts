/**
 * E2E test: start the real Express server and perform basic health checks
 */

import supertest, { type SuperTest, type Test } from 'supertest'
import { createApp } from '../../src/app'

describe('E2E: start server and check health endpoints', () => {
  let request: SuperTest<Test>

  beforeAll(() => {
    process.env.PORT = '0'
    const app = createApp()
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
