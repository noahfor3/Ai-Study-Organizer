# TEST CASES — SPRINT 3 (LINKED TO TEST PLAN)

> Purpose: Provide explicit, written test cases (IDs, steps, inputs, expected outputs) tied to our Test Plan. These cases map to existing Jest/Playwright tests or will be mirrored soon. The rubric cares about this written plan.

## Mapping (fill as needed)
Add links from each TC to its actual test file/title (or leave "TBD" if not yet mirrored):
- TC-01 → tests/integration/quiz.endpoint.test.ts
- TC-02 → tests/integration/quiz.endpoint.test.ts
- TC-03 → tests/unit/quiz-generator.service.test.ts
- TC-04 → tests/integration/quiz.endpoint.test.ts
- TC-05 → tests/integration/signup-normalization.test.ts
- TC-06 → tests/e2e-playwright/dashboard.spec.ts (TBD - schedule generation)
- TC-07 → tests/integration/summarize.endpoint.test.ts
- TC-08 → tests/ui/theme-toggle-button.test.tsx
- TC-09 → tests/ui/login-page.test.tsx
- TC-10 → tests/e2e-playwright/auth.spec.ts (TBD - a11y audit)

## Test Case Table

| ID | PURPOSE / METHODOLOGY | PRECONDITIONS | STEPS | INPUTS | EXPECTED OUTPUTS | LINKED PLAN SECTION |
|---|---|---|---|---|---|---|
| TC-01 | Scenario-based – valid quiz generation from short text | API up locally/CI; keys or mock model configured | POST `/api/quizzes` | ~300–600 chars text; count=10; mix types | 10 items; MCQ have exactly 1 correct; answer key present | TEST PLAN – QUIZ GENERATION QZ-01/05 |
| TC-02 | Boundary – invalid/empty text input | API up; validation middleware | POST `/api/quizzes` | text="", count=5 | 400 error; friendly message; no model call | QZ-07/QZ-14 |
| TC-03 | Functional – response metadata presence | API up; response schema | POST `/api/quizzes` | medium text; count=6 | `tokensUsed`, `generatedAt`, `sourceLength` present and sane | QZ-02 + metadata |
| TC-04 | Error handling – upstream model failure | Mock 5xx/timeout | POST `/api/quizzes` | normal text | Proper 5xx/timeout handling; retry guidance; no crash | QZ-14 |
| TC-05 | Integration – Supabase save failure path | Mock DB error | Save quiz results route | quiz payload | 500 with clear message; no duplicate records | Flashcards/Quiz persistence |
| TC-06 | Scenario-based – conflict-free schedule | Scheduler enabled; busy blocks mocked | POST `/api/schedule/generate` | tasks + deadlines + busy events | No overlaps; earlier deadlines scheduled first | SCHEDULE SG-01/02 |
| TC-07 | Functional – summarization length control | Summarize endpoint | POST `/api/summarize` | 1–2 page text; mode=abstract | 100–150 words ±10%; no invented facts | SUM SUM-01/03/06 |
| TC-08 | UI interaction – theme toggle | UI test env | Render, open dropdown, choose theme | — | setTheme called with `light/dark`; icons visible; accessible label | THEME TOGGLE PLAN |
| TC-09 | UI form – login basics | Login page render | Type email/password; check link | email/pass | Fields accept input; signup link href "/signup" | LOGIN PAGE PLAN |
| TC-10 | A11y/responsive – axe + viewports | axe/Playwright setup | Run audit on key pages | — | 0 critical/serious violations; layouts intact at 320–1440px | A11Y PLAN |

## Notes
- If test titles don't include TC IDs, keep the **Mapping** section updated (Case ID → file/test name).
- Add more cases if needed; target 8–10 clear cases for grading.

