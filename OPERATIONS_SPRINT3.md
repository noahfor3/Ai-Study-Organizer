# Operations Documentation - Sprint 3

**Contributor:** Noah Yarbrough  
**Project:** AI Study Organizer  
**Sprint Duration:** Sprint 3  
**Branch:** `noah`

---

## 1. Environment Setup

### Node.js Version
- **Required:** Node.js v18.0.0 or higher
- **Recommended:** Node.js v18.20.3+ (tested version)
- **CI/CD:** Node.js v18 (GitHub Actions)

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Model Configuration
MODEL_API_KEY=your-model-api-key
MODEL_TEMPERATURE=0

# Node Environment
NODE_ENV=development

# Server Configuration (Optional)
PORT=3001
HOST=localhost
```

### Supabase Configuration
- **Project URL:** Set in `NEXT_PUBLIC_SUPABASE_URL`
- **Anon Key:** Public key for client-side operations
- **Service Role Key:** Server-side operations (optional, for admin operations)
- **Browser Client:** Configured in `src/lib/supabaseBrowser.ts`
- **Server Client:** Configured in `src/app/api/auth/login/route.ts`

### Dependencies
All dependencies are managed via `package.json`:
- **Next.js 15.2.3** - React framework
- **@supabase/supabase-js 2.75.1** - Supabase client library
- **Genkit 1.6.2** - AI flow framework
- **Express 4.18.2** - API server
- **TypeScript 5** - Type checking
- **Jest 29.7.0** - Testing framework

---

## 2. Run Commands

### Development

#### Next.js Development Server
```bash
npm run dev
```
- Starts Next.js dev server with Turbopack
- Runs on `http://localhost:9002`
- Hot reload enabled
- Environment: `.env.local` loaded automatically

#### API Server (Standalone)
```bash
npm run api:dev
```
- Starts Express API server with ts-node-dev
- Runs on `http://localhost:3001` (or PORT env var)
- Hot reload enabled
- Used for testing API endpoints independently

#### Genkit AI Development
```bash
npm run genkit:dev
```
- Starts Genkit development server
- Used for testing AI flows locally

### Testing

#### Run All Tests
```bash
npm test
```
- Runs all unit, integration, and E2E tests
- Uses `--runInBand` for sequential execution

#### Unit Tests Only
```bash
npm run test:unit
```
- Runs tests in `tests/unit/` directory
- Fast execution for quick feedback

#### Integration Tests Only
```bash
npm run test:integration
```
- Runs tests in `tests/integration/` directory
- Tests API endpoints and service integrations

#### Test Coverage
```bash
npm run test:coverage
```
- Generates coverage report
- Threshold: 80% for statements, branches, functions, lines
- Output: `coverage/` directory

#### Watch Mode
```bash
npm run test:watch
```
- Runs tests in watch mode
- Re-runs tests on file changes

### Building

#### Build Next.js Application
```bash
npm run build
```
- Creates production build in `.next/` directory
- Type checks and optimizes code
- Requires environment variables set

#### Build API Server
```bash
npm run api:build
```
- Compiles TypeScript to JavaScript
- Output: `dist/` directory
- Uses `tsconfig.server.json`

#### Start Production Server
```bash
npm start
```
- Starts Next.js production server
- Requires `npm run build` first

#### Start Production API Server
```bash
npm run api:start
```
- Starts compiled Express server
- Requires `npm run api:build` first

### Code Quality

#### Linting
```bash
npm run lint
```
- Runs ESLint on all `.ts` and `.tsx` files
- Checks for code style violations
- Part of CI/CD pipeline

#### Type Checking
```bash
npm run typecheck
```
- Runs TypeScript compiler without emitting files
- Validates type safety
- Part of CI/CD pipeline

---

## 3. CI/CD Pipeline & Build Artifacts

### GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/ci.yml`) runs on:
- **Pull requests** to `main` branch
- **Pushes** to `main` branch

### Pipeline Jobs

#### 1. Build & Lint Job
- **Runs:** Linting, type checking, Next.js build, API build
- **Environment:** Node.js 18, Ubuntu latest
- **Artifacts:** Build output (not persisted, but validated)
- **Secrets Used:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### 2. Unit Tests Job
- **Runs:** Unit test suite
- **Depends On:** Build job
- **Environment:** Node.js 18, Ubuntu latest

#### 3. Integration Tests Job
- **Runs:** Integration tests + health check smoke test
- **Depends On:** Build job
- **Health Check:** Starts API server, tests `/health` endpoint
- **Environment:** Node.js 18, Ubuntu latest

#### 4. Coverage Report Job
- **Runs:** Full test suite with coverage
- **Depends On:** Unit + Integration jobs
- **Artifacts:** Coverage report uploaded to GitHub Actions
- **Threshold:** 80% minimum coverage

### Build Artifacts

#### Local Development
- **Next.js Build:** `.next/` directory (gitignored)
- **API Build:** `dist/` directory (gitignored)
- **Coverage:** `coverage/` directory (gitignored)

#### CI/CD Builds
- **Status:** Validated but not deployed (local development focus)
- **Deployment:** Currently manual via Vercel (if configured)
- **Artifact Storage:** Coverage reports stored as GitHub Actions artifacts

### Deployment Strategy

#### Current State
- **Primary:** Local development and testing
- **CI/CD:** Validates builds and tests
- **Production:** Manual deployment (if Vercel configured)

#### Vercel Integration (If Configured)
- **Auto-deploy:** Merges to `main` trigger Vercel deployments
- **Preview:** PRs create preview deployments
- **Environment Variables:** Set in Vercel dashboard

---

## 4. Health Check Endpoints

### Main Health Check
**Endpoint:** `GET /health`  
**Service:** Express API Server  
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-16T11:38:27.418Z",
  "service": "ai-study-organizer-api",
  "version": "1.0.0"
}
```

**Usage:**
- Monitors API server health
- Used in CI/CD smoke tests
- Available at: `http://localhost:3001/health`

### Summarization Service Health Check
**Endpoint:** `GET /api/summarize/health`  
**Service:** Summarization API  
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-16T11:38:27.418Z",
  "service": "summarization-api"
}
```

### Quiz Service Health Check
**Endpoint:** `GET /api/quiz/health`  
**Service:** Quiz Generator API  
**Response:**
```json
{
  "status": "healthy",
  "service": "quiz-generator",
  "timestamp": "2024-11-16T11:38:27.418Z"
}
```

### Testing Health Checks
```bash
# Main health check
curl http://localhost:3001/health

# Summarization health check
curl http://localhost:3001/api/summarize/health

# Quiz health check
curl http://localhost:3001/api/quiz/health
```

---

## 5. Logging & Monitoring

### Logger Implementation

**File:** `src/lib/logger.ts`

**Features:**
- Silences output during tests (`NODE_ENV=test`)
- Respects `SUPPRESS_LOGS` environment variable
- Provides `log`, `info`, `warn`, `error` methods

**Usage:**
```typescript
import logger from '@/lib/logger';

logger.info('Server starting...');
logger.error('Error occurred:', error);
logger.warn('Warning message');
```

### Request Logging

**Middleware:** `src/app.ts`

**Features:**
- Logs all incoming requests with:
  - Timestamp
  - HTTP method
  - Request path
  - Client IP address

**Example Output:**
```
[2024-11-16T11:38:27.418Z] POST /api/summarize - IP: ::1
[2024-11-16T11:38:27.418Z] GET /health - IP: ::1
```

### Request ID Tracking

**Implementation:** `src/app/api/summarize.router.ts`, `src/app/api/quiz.router.ts`

**Features:**
- Generates unique request IDs for each API request
- Format: `req_{timestamp}_{random}`
- Included in response and error logs
- Enables request tracing across services

**Example Request ID:**
```
req_1734439107418_a3f2b1c9
```

### Error Logging

**Error Handling:**
- All errors logged with full stack traces
- Request IDs included in error logs
- User-friendly error messages returned to clients
- Detailed errors logged server-side only

**Example:**
```typescript
logger.error('Quiz generation failed', {
  error: error.message,
  requestId,
  contentLength: content.length
});
```

### Logging Decisions (Sprint 3)

1. **Request ID Generation:** Added to improve debugging and traceability
2. **Structured Logging:** Errors include context (requestId, contentLength, etc.)
3. **Test Suppression:** Logger automatically silences during tests
4. **IP Logging:** Added for security monitoring
5. **Service Identification:** Each health check identifies its service

---

## 6. Local Development Workflow

### Initial Setup
1. Clone repository
2. Run `npm install`
3. Create `.env.local` with required variables
4. Verify Supabase connection
5. Start dev server: `npm run dev`

### Daily Development
1. Pull latest changes: `git pull origin main`
2. Start dev server: `npm run dev`
3. Make changes with hot reload
4. Run tests: `npm test`
5. Check linting: `npm run lint`
6. Commit and push changes

### Testing Workflow
1. Write/update tests
2. Run specific test: `npm run test:unit -- test-name`
3. Check coverage: `npm run test:coverage`
4. Fix any failing tests
5. Ensure all tests pass before committing

### Debugging
1. Check server logs in terminal
2. Use browser DevTools for client-side issues
3. Check API responses via network tab
4. Use request IDs to trace requests
5. Test health endpoints to verify server status

---

## 7. Troubleshooting

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::9002`

**Solution:**
```bash
# Find process using port
lsof -i :9002

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### Module Not Found Errors
**Error:** `Module not found: Can't resolve '@supabase/supabase-js'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
**Error:** `NEXT_PUBLIC_SUPABASE_URL is undefined`

**Solution:**
- Ensure `.env.local` exists in project root
- Restart dev server after adding variables
- Verify variable names match exactly (case-sensitive)
- Check for typos in variable names

### TypeScript Compilation Errors
**Error:** Type errors in CI/CD

**Solution:**
```bash
# Run type checking locally
npm run typecheck

# Fix type errors
# Ensure all interfaces match implementations
# Check for missing properties in mock objects
```

### Health Check Failing
**Error:** Health endpoint returns 500

**Solution:**
- Check server logs for errors
- Verify all dependencies installed
- Ensure environment variables set
- Check database connection (if applicable)

---

## 8. Sprint 3 Improvements

### Operations Enhancements
1. ✅ **Health Check Endpoints:** Added `/health`, `/api/summarize/health`, `/api/quiz/health`
2. ✅ **Request ID Tracking:** Implemented unique request IDs for all API requests
3. ✅ **Structured Logging:** Enhanced error logging with context
4. ✅ **CI/CD Pipeline:** Fixed all linting and TypeScript errors
5. ✅ **Local Development Setup:** Documented environment setup and run commands
6. ✅ **Missing Dependencies:** Added `@supabase/supabase-js` to package.json
7. ✅ **Browser Client:** Created `src/lib/supabaseBrowser.ts` for client-side Supabase

### Documentation
- Created comprehensive operations documentation
- Documented all run commands and environment setup
- Added troubleshooting section
- Documented CI/CD pipeline and build artifacts
- Added health check endpoint documentation

---

**Last Updated:** Sprint 3  
**Maintained By:** Noah Yarbrough

