✅ SPRINT 3 — Errors & Bugs Documentation

(Part 1 of your Sprint 3 rubric deliverables)
Prepared for Ai-Study-Organizer | Feature: Generate Notes & Schedule

1. Overview

This document summarizes all significant bugs encountered during Sprint 3, including descriptions, root-cause analyses, replication steps, resolutions, and verification evidence.
This aligns with recommended software QA standards, including IEEE 1044 (Classification for Software Anomalies) and Google’s Engineering Practices documentation.
Sources:

IEEE Standard 1044 for Software Anomaly Classification

Google Engineering Practices: Code Reviews

Martin Fowler, Refactoring: Improving the Design of Existing Code

2. Bug List (Sprint 3)
### Bug 1 — TypeScript Error: “This expression is not callable because it is a 'get' accessor”

File: src/app/(app)/api/summarize.router.ts
Severity: High
Status: Fixed

Description

During feature implementation, TypeScript threw an error indicating that a variable typed as a getter (get) was being invoked like a function, causing the build to fail.

Error Snippet
This expression is not callable because it is a 'get' accessor.
Type 'String' has no call signatures.

Replication Steps

Checkout branch feature/generate-notes.

Run the local TypeScript compiler:

npx tsc --project tsconfig.json


Observe the compile-time failure.

Root Cause

A getter property was mistakenly treated as a callable function.
Example:

someProperty()


instead of

someProperty


This violates TypeScript’s type system rules (TS 6234).

Fix Implemented

Removed the parentheses on the getter call.

Refactored associated imports to ensure the correct type interfaces load.

Added explicit string type annotations to prevent type widening.

Verification

Build succeeded locally.

Jest integration tests passed for note generation and summarization.

CI pipeline passed after patch commit 3bac7c8.

Bug 2 — CI Failure: Missing '}' in app.ts

File: src/app.ts
Severity: Critical
Status: Fixed

Description

CI ran Jest integration tests and failed with a TypeScript parser error:

src/app.ts:95:27 - error TS1005: '}' expected.

Replication Steps

Run integration tests on CI or locally:

npm run test:integration


Watch the test runner fail at summarize.endpoint.test.ts.

Root Cause

A merge conflict resolution in a previous PR left a hanging comment block and removed the closing braces for the createApp() function.

This created malformed syntax between lines 81–95.

Fix Implemented

Restored missing }.

Reformatted and restructured app.ts so all route blocks, middleware, and comments align with Node/Express conventions.

This follows Google’s recommended style: "Make code obvious, readable, and minimally surprising."

Verification

All integration tests pass.

npm run build succeeds.

CI successfully processes app.ts without parser errors.

Bug 3 — Incorrect Import Paths After Directory Refactor

File: Multiple (summarize.router.ts, generate.router.ts, app.ts)
Severity: Medium
Status: Fixed

Description

After restructuring the project folder layout (src/app/(app)/api/), several routes imported controllers using outdated paths, causing runtime “module not found” errors.

Replication Steps

Run the dev server:

npm run dev


Navigate to:

http://localhost:3000/api/summarize


Observe server crash.

Root Cause

Paths were not updated after folder reorganization.
This violated Node’s module resolution rules.

Fix Implemented

Updated all imports to match the new folder structure.

Added a path alias (@/) in tsconfig.json for future-proofing.

Ran a full project-wide search to avoid orphan imports.

Verification

API routes now load correctly.

Vercel build logs are clean.

Jest integration tests detect all routers.

Bug 4 — Feature Branch Divergence (Git Rebase Merge Conflict)

Branches:

feature/generate-notes

feature/generate-schedule-meron

Severity: Medium
Status: Resolved carefully

Description

Two feature branches edited the same shared file (app.ts), producing merge conflicts.

Replication Steps

Attempt to merge any branch into main.

Observe conflict sections in app.ts.

Root Cause

Concurrent development without rebasing regularly caused drift between branches.

Fix Implemented

A manual rebase was performed.

Conflicted blocks were compared against business logic from both branches.

Only valid, tested logic was preserved.

Team-approved commit message was added:

“Addressed merge conflicts in app.ts by integrating updates from multiple branches and ensuring stable routing.”

Verification

No functional regressions in routing.

CI pipeline passes.

Feature branches now rebase cleanly on main.
