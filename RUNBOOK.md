# SmartPath AI Study Organizer - Runbook

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google AI API key (for AI features)
- Firebase project setup (for backend services)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Ai-Study-Organizer
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env.local
   
   # Required environment variables:
   # GOOGLE_AI_API_KEY=your_google_ai_key
   # FIREBASE_API_KEY=your_firebase_key
   # FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   # FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Start Development Servers**
   ```bash
   # Main Next.js app (port 9002)
   npm run dev
   
   # AI/Genkit server (separate terminal)
   npm run genkit:dev
   ```

4. **Access Application**
   - Main App: http://localhost:9002
   - Genkit UI: http://localhost:4000 (when genkit server is running)

## Logs & Monitoring

### Log Locations
- **Application Logs**: Browser console + terminal output
- **Build Logs**: `.next/` directory (auto-generated)
- **AI Flow Logs**: Genkit console output
- **Error Logs**: 
  - `npm-debug.log*` (npm errors)
  - `yarn-debug.log*` (yarn errors)
  - Browser DevTools Console

### Logging Commands
```bash
# View real-time logs
npm run dev 2>&1 | tee dev.log

# Check for TypeScript errors
npm run typecheck

# Lint code
npm run lint

# Monitor AI flows
npm run genkit:watch
```

### Debugging
- **TypeScript Errors**: Check `tsconfig.json` and run `npm run typecheck`
- **Build Issues**: Clear `.next/` and rebuild
- **AI Issues**: Verify Google AI API key and Genkit server status
- **Firebase Issues**: Check Firebase config and network connectivity

## Patch Process

### Security Updates
1. **Dependency Updates**
   ```bash
   # Check for outdated packages
   npm outdated
   
   # Update all dependencies
   npm update
   
   # Update specific package
   npm install package@latest
   ```

2. **Security Audit**
   ```bash
   # Run security audit
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   
   # Force fix (use with caution)
   npm audit fix --force
   ```

3. **Patch Application**
   ```bash
   # Apply patches (if using patch-package)
   npm run postinstall
   
   # Rebuild after patches
   npm run build
   ```

### Emergency Patches
1. **Hot Fix Process**
   ```bash
   # Create hotfix branch
   git checkout -b hotfix/security-patch
   
   # Apply fix
   # ... make changes ...
   
   # Test locally
   npm run dev
   npm run typecheck
   
   # Commit and push
   git add .
   git commit -m "hotfix: security patch"
   git push origin hotfix/security-patch
   ```

2. **Rollback Process**
   ```bash
   # Revert to previous version
   git revert <commit-hash>
   
   # Or reset to specific commit
   git reset --hard <commit-hash>
   
   # Rebuild and restart
   npm run build
   npm start
   ```

## Common Issues & Solutions

### Port Conflicts
- **Issue**: Port 9002 already in use
- **Solution**: Kill process or change port in `package.json`

### AI Features Not Working
- **Issue**: Genkit server not running
- **Solution**: Start with `npm run genkit:dev`

### Build Failures
- **Issue**: TypeScript/ESLint errors
- **Solution**: Check `next.config.ts` - errors are ignored during builds

### Firebase Connection Issues
- **Issue**: Authentication/DB connection fails
- **Solution**: Verify Firebase config and API keys

## Production Deployment

### Build Process
```bash
# Production build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

### Environment Variables (Production)
- Set all required environment variables in deployment platform
- Ensure Google AI API key has proper quotas
- Configure Firebase for production environment

## Maintenance

### Regular Tasks
- **Weekly**: Check for dependency updates
- **Monthly**: Run security audits
- **Quarterly**: Review and update AI model configurations
- **As needed**: Monitor Firebase usage and costs

### Backup Strategy
- **Code**: Git repository (already version controlled)
- **Data**: Firebase automatic backups
- **Configuration**: Environment variables documented
- **Dependencies**: `package-lock.json` ensures reproducible builds
