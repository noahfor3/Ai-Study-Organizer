# SmartPath AI Study Organizer - Threat Model

## Security Threats & Mitigations

### 🚨 SQL Injection
**Risk Level**: LOW
- **Threat**: Malicious SQL code injection through user inputs
- **Current State**: NoSQL database (Firebase Firestore) - not vulnerable to traditional SQL injection
- **Mitigations**:
  - ✅ Using Firebase Firestore (NoSQL) eliminates SQL injection vectors
  - ✅ Input validation with Zod schemas in AI flows (`generate-flashcards-flow.ts`, `generate-notes-flow.ts`)
  - ✅ React Hook Form with validation prevents malformed data submission
  - 🔄 **Recommendation**: Continue using NoSQL and maintain strict input validation

### 🌐 Cross-Site Scripting (XSS)
**Risk Level**: MEDIUM
- **Threat**: Malicious scripts injected through user-generated content
- **Current State**: Next.js with React provides some protection, but user content areas exist
- **Mitigations**:
  - ✅ React's built-in XSS protection through JSX escaping
  - ✅ Next.js automatic sanitization of user inputs
  - ✅ Content Security Policy (CSP) headers recommended for production
  - ⚠️ **Gap**: Document upload and AI-generated content need sanitization
  - 🔄 **Recommendation**: 
    - Implement DOMPurify for user-uploaded document content
    - Add CSP headers in `next.config.ts`
    - Sanitize AI-generated flashcard/note content before display

### ⚡ Service Downtime
**Risk Level**: HIGH
- **Threat**: Application unavailability affecting student study schedules
- **Current State**: Single deployment, no redundancy
- **Mitigations**:
  - ✅ Firebase provides 99.95% uptime SLA
  - ✅ Google AI services have high availability
  - ⚠️ **Gap**: Single Next.js deployment point of failure
  - 🔄 **Recommendations**:
    - Deploy to Vercel with automatic failover
    - Implement health checks and monitoring
    - Add offline functionality for critical features (study schedules)
    - Set up alerting for service degradation
    - Consider multi-region deployment for critical study periods

## Additional Security Considerations

### Authentication & Authorization
- **Current**: Firebase Auth integration present
- **Recommendation**: Implement role-based access control for different user types

### Data Privacy
- **Current**: Student data stored in Firebase
- **Recommendation**: Implement data encryption at rest and in transit
- **Compliance**: Consider FERPA compliance for educational data

### API Security
- **Current**: Google AI API key management
- **Recommendation**: Implement API rate limiting and usage monitoring
- **Cost Control**: Monitor AI API usage to prevent unexpected charges

## Quick Security Checklist

- [ ] Environment variables properly secured (`.env*` in `.gitignore`)
- [ ] Input validation on all user inputs (Zod schemas)
- [ ] HTTPS enforced in production
- [ ] Regular dependency security audits (`npm audit`)
- [ ] Firebase security rules properly configured
- [ ] AI API usage monitoring and rate limiting
- [ ] Backup and disaster recovery plan
- [ ] Security headers implementation (CSP, HSTS)
