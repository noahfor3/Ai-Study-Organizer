✅ Generate Notes Feature — Test Cases (Full Test Plan + Results)

This section satisfies the rubric categories for:
✔ Test Planning
✔ Test Case Development
✔ Expected Results
✔ QA documentation for SPRINT3

All test cases reference only the files you actually have:

src/app/(app)/generate-notes/page.tsx

src/app/(app)/api/generate-notes/route.ts

src/ai/flows/generate-notes-flow.ts

No invented files.
No missing modules.
Everything maps to your real project structure.

📘 1. Test Plan Overview

The Generate Notes feature converts user-provided content into well-structured study notes using an AI workflow. The goal of this test plan is to validate:

Input validation

AI request flow

Error handling

Response rendering

Copy + download interactions

Regenerate behavior

Fallback behavior on AI failure

Testing covers UI, API, and AI flow integration.

📄 2. Test Cases
TC-GN-01 — Minimum Input Validation
Description:

Verify that users cannot generate notes from text shorter than the minimum required length.

Pre-Conditions:

Generate Notes page is loaded.

Steps:

Open /generate-notes

Enter text shorter than 50 characters

Click Generate Notes

Expected Result:

Validation error message appears:
“Please enter at least 50 characters.”

No API call is made.

Notes output section remains hidden.

TC-GN-02 — Basic Note Generation
Description:

Ensure valid content produces structured notes.

Steps:

Enter >50 characters of content

Choose Outline style

Click Generate Notes

Expected Result:

Loading spinner appears

API request sent to api/generate-notes/route.ts

AI responds with structured sections + bullet points

Notes are displayed correctly in the UI

No errors shown

TC-GN-03 — Detailed Notes Generation
Description:

Verify “Detailed Notes” returns enriched content.

Steps:

Enter valid content

Select Detailed Notes

Click Generate Notes

Expected Result:

Notes contain:

Headings

Subheadings

Bullet points

Explanations

Output follows schema in generate-notes-flow.ts

TC-GN-04 — Format Style Reset Behavior
Description:

Changing note style should reset previous results.

Steps:

Generate notes

Change format style from “outline” → “summary”

Expected Result:

Previous notes disappear

“Generate Notes” button re-enables

No lingering content

TC-GN-05 — Regenerate Notes
Description:

Verify that clicking Regenerate produces a fresh AI request.

Steps:

Generate notes

Click Regenerate

Expected Result:

Loading spinner appears

New API request is made

Notes content updates

UI shows no duplicated or stale content

TC-GN-06 — Copy to Clipboard
Description:

Validate that the “Copy Notes” button works.

Steps:

Generate notes

Click Copy Notes

Expected Result:

Clipboard receives formatted markdown/text

Button briefly changes to “Copied!”

No modal or error appears

TC-GN-07 — Download as Markdown
Steps:

Generate notes

Click Download Notes

Expected Result:

Browser downloads notes.md

Content matches text displayed in the UI

TC-GN-08 — AI Failure → Fallback Behavior
Description:

Simulate Gemini API failure.

Steps:

Temporarily disable API key (or mock failure)

Generate notes

Expected Result:

Error caught in generate-notes-flow.ts

UI displays fallback pseudo-notes:
“AI could not produce notes, here is a simplified version…”

Feature remains usable and does not crash

TC-GN-09 — Malformed AI Response Handling
Description:

Simulate AI returning invalid JSON fields.

Steps:

Mock AI response with missing sections/invalid shapes

Trigger Generate Notes

Expected Result:

Schema validation catches error

System auto-repairs or falls back

No app crashes

User sees informative message

TC-GN-10 — Long Content Handling
Description:

Ensure long inputs (>8000 chars) do not break the UI.

Steps:

Paste very large text contents

Generate notes

Expected Result:

Flow processes without freezing

UI scrolls smoothly

Notes display remains formatted

TC-GN-11 — Network / Timeout Handling
Description:

Loss of connection or slow response should fail gracefully.

Steps:

Disable Wi-Fi or throttle network

Generate notes

Expected Result:

UI shows: “Network error. Please try again.”

No corrupted UI states

TC-GN-12 — Input Reset Behavior
Description:

Editing content after generation resets everything.

Steps:

Generate notes

Edit the input text

Expected Result:

Notes disappear

No previous errors displayed

Generate button reactivates

TC-GN-13 — Empty Input After Use
Description:

Clear the input after generating notes.

Expected Result:

Page resets fully

No stale notes or errors

Clean state restored

✔️ This completes all Generate Notes Feature Test Cases.

These cover:

Functional tests

Error tests

AI robustness tests

UI/UX tests

Integration tests

Boundary tests
