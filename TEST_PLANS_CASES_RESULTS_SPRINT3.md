✅ SCHEDULE VIEW — TEST CASES (FINAL)
Files Involved

src/app/(app)/schedule-view/page.tsx

src/ai/flows/generate-schedule-view-flow.ts

src/ai/flows/generate-schedule-flow.ts

src/app/(app)/api/generate-schedule/route.ts

src/app/(app)/generate-schedule/page.tsx

1️⃣ Functional Test Cases
TC-01 — Page Render: Schedule View Loads Successfully

Purpose: Ensure the Schedule View page renders without crashing.

Target File: schedule-view/page.tsx

Steps:

Navigate to /schedule-view.

Allow component to load.

Expected Result:

Page renders default layout.

No errors in console.

TC-02 — API Integration: Valid Schedule Returns UI Elements

Purpose: Ensure the Schedule View correctly fetches the schedule from the backend.

Target Files:

generate-schedule-view-flow.ts

generate-schedule-flow.ts

api/generate-schedule/route.ts

Steps:

Trigger a valid schedule-generation request (from the app UI at /generate-schedule).

After schedule is generated, navigate to /schedule-view.

Expected Result:

The view displays time blocks.

The data matches what generate-schedule-flow.ts returns.

TC-03 — Display of Days & Time Blocks

Purpose: Ensure correct rendering of day columns and associated tasks.

Target File: schedule-view/page.tsx

Steps:

Load the page with sample schedule data injected (mock AI response).

Inspect each displayed day (Mon–Sun).

Expected Result:

Every day with tasks is visible.

Each task shows:

Title

Time

Estimated duration

TC-04 — Handling Empty Schedule

Purpose: When the backend returns an empty schedule.

Target Files:

generate-schedule-view-flow.ts

schedule-view/page.tsx

Steps:

Mock flow to return an empty schedule array.

Load /schedule-view.

Expected Result:

A friendly “No schedule available” message appears.

No crash or broken UI layout.

TC-05 — AI Flow Failure Handling

Purpose: Validate graceful handling of AI or network errors.

Target File: generate-schedule-view-flow.ts

Steps:

Mock an error thrown inside generate-schedule-view-flow.ts.

Load the Schedule View.

Expected Result:

UI displays an error message such as “Unable to load schedule”.

No unhandled promise rejection.

TC-06 — Data Format Validation

Purpose: Ensure incorrect schedule data is safely rejected.

Target Files:

generate-schedule-view-flow.ts

schedule-view/page.tsx

Steps:

Mock invalid return shape:

{ "schedule": "wrong_format" }


Load the page.

Expected Result:

The page shows a validation error OR fallback message.

No UI crash.

2️⃣ UI Test Cases
TC-07 — Loading State

Purpose: Confirm a spinner/“loading” indicator appears during fetch.

Steps:

Add artificial await new Promise(r => setTimeout(r, 2000)) delay in generate-schedule-view-flow.ts.

Navigate to /schedule-view.

Expected Result:

Loading indicator is shown.

Spinner disappears after data arrives.

TC-08 — Correct Text Styling & Components Rendered

Purpose: UI sanity check.

Steps:

Load with example data.

Inspect elements.

Expected Result:

Headings styled correctly.

Task cards correctly aligned.

No overflow, layout shift, or misaligned blocks.

3️⃣ Interaction & Behavior Test Cases
TC-09 — Regenerate Button Navigates Properly

(If the page includes a “Regenerate” or “Back to generator” action)

Target File: schedule-view/page.tsx

Steps:

Click “Regenerate Schedule”.

Observe navigation.

Expected Result:

Redirect to /generate-schedule.

TC-10 — Scroll Behavior

Purpose: Ensure long schedules scroll properly.

Steps:

Inject 30+ time blocks.

Load /schedule-view.

Expected Result:

Smooth scrolling.

No page freeze or jank.

4️⃣ Backend & Flow Test Cases
TC-11 — Route Invocation: API Called With Correct Body

Purpose: Ensure generate-schedule-flow.ts calls the API correctly.

Target File: generate-schedule-flow.ts

Steps:

Mock fetch.

Trigger schedule generation from /generate-schedule.

Expected Result:

Route receives correct payload:

{ tasks: [...], preferences: {...} }

TC-12 — Correct Mapping From AI → Render Data

Purpose: Validate transformation between:
AI output → schedule-view-flow → schedule-view/page.tsx

Target Files:

generate-schedule-view-flow.ts

schedule-view/page.tsx

Steps:

Mock AI response with 2–3 tasks.

Print output of generate-schedule-view-flow.ts.

Compare with UI.

Expected Result:

UI data exactly matches flow-processed data.

5️⃣ Negative & Edge Cases
TC-13 — Missing Required Fields

(mock incomplete AI response)

Expected Result:

Errors handled gracefully.

No blank UI or crash.

TC-14 — Extremely Long Task Titles

Expected Result:

Text wraps properly.

Layout remains consistent.

TC-15 — Overlapping Time Blocks

Expected Result:

UI does not collapse or overlap visually.

You may display a warning depending on implementation.

📚 Citations (Reputable Sources)

React Testing Best Practices
https://react.dev/learn/testing

Next.js App Router Testing Documentation
https://nextjs.org/docs/app/building-your-application/testing

Jest Official Documentation
https://jestjs.io/docs/getting-started

W3C Guidelines for UI Behavior & Accessibility
https://www.w3.org/TR/WCAG21/

Google Testing Blog – Engineering Best Practices
https://testing.googleblog.com/
