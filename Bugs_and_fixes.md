## Bugs and Fixes

### BUG-001
**Description:** Gemini API key not detected; app returned “Please pass in the API key…”  
**Found In:** Build 0.1  
**Test That Found It:** Initial API test on `generate-schedule-flow.ts`  
**Fixed In:** Build 0.2  
**Evidence:** Screenshot of console error before fix; successful output after fix  

### BUG-002
**Description:** Schedule generator returned empty results with valid inputs  
**Found In:** Build 0.2  
**Test That Found It:** Manual test with user prompts  
**Fixed In:** Build 0.3  
**Evidence:** Screenshot of corrected schedule output  

### BUG-003
**Description:** Slow response times (~14s) due to unoptimized API call  
**Found In:** Build 0.3  
**Test That Found It:** Response time testing in console  
**Fixed In:** Build 0.4  
**Evidence:** Screenshot showing faster response after fix

**Summary:** All bugs were resolved with proper environment configuration, prompt handling, and code optimization. Screenshots and commit links are attached for evidence.
