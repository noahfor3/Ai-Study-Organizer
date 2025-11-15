# 🧪 Test Planning — AI Study Organizer (Feature: Schedule Generator)

### Author:
**Amr (Mero) Mahmoud**  
**Sprint 2 — CPSC 491 (AI Study Organizer)**

---

## 1. Objective

The goal of this test plan is to ensure the **AI Schedule Generator** produces accurate, reliable, and user-centered schedules using the integrated **Gemini API**. The tests will verify correctness, usability, and performance across various inputs.

---

## 2. Development & Testing Background

Before reaching the current solution, I conducted several rounds of early testing and experimentation:

- I first **tested Pseudo AI**, a basic implementation for generating text-based responses.  
  However, I found that it was **not providing accurate or structured outputs** for the schedule feature.  
- After this, I researched more advanced models and decided to integrate **Google’s Gemini API** because it was **free to use**, **more powerful**, and **offered better control over outputs**.  
- The setup required an **API key**, and I initially had difficulty finding the correct configuration.  
  Through trial and error, I learned how to properly set it in `.env.local` and confirm the connection through a model listing script (`listModels.js`).  
- Once the integration was successful, I verified the functionality by **testing multiple prompts and inputs**, confirming that the Gemini API correctly generated detailed and logical schedules.
- I can also track my API usage and model calls directly from my **Google Cloud Gemini dashboard**, allowing continuous monitoring and improvement.

This background demonstrates the iterative testing and debugging process that led to the final stable integration.

---

## 3. Testing Methodologies

We will use the following methodologies to test the application:

| Methodology | Description | Why It Makes Sense |
|--------------|--------------|--------------------|
| **Unit Testing** | Test individual components like API calls and data formatting functions. | Ensures that each function (like generating schedule slots) works correctly before integration. |
| **Integration Testing** | Test the interaction between the Gemini API, backend (Node/Express), and frontend (Next.js). | Validates that the AI results flow correctly between system components. |
| **End-to-End (E2E) Testing** | Simulate real user scenarios (like generating schedules for different courses). | Ensures the full user experience works smoothly. |
| **Performance Testing** | Measure API response time and rendering speed. | Ensures schedule generation stays efficient even under load. |
| **Regression Testing** | Re-run all test cases after updates. | Ensures no previous features are broken by new changes. |

---

## 4. Tools & Frameworks

| Tool | Purpose |
|------|----------|
| **Jest** | Unit and integration tests for Node.js functions. |
| **React Testing Library** | To test UI and ensure the pages render the correct schedules. |
| **Postman** | Manual API testing to validate Gemini integration. |
| **GitHub Actions (CI/CD)** | Automate test execution and ensure tests run before merging pull requests. |
| **Google Gemini Dashboard** | To monitor API key usage and model performance metrics. |

---

## 5. Test Plan Schedule

| Week | Task | Responsible |
|------|-------|-------------|
| Week 1 | Write unit test cases for AI prompt handler and Gemini API call. | Meron |
| Week 2 | Write integration tests for backend and frontend interaction. | Team |
| Week 3 | Execute E2E tests and record results. | Team |
| Week 4 | Review results, fix bugs, and document test summary. | Team |

---

## 6. Resources Required
- **Development Environment:** Node.js, Next.js, Gemini API Key  
- **Testing Environment:** Localhost & Vercel staging environment  
- **Team Resources:** 3 members responsible for backend, frontend, and testing tasks  
- **External Resources:** Google Cloud Gemini Console for API tracking and monitoring  

---

## 7. Risk Assessment
| Risk | Mitigation Strategy |
|------|----------------------|
| API rate limits or downtime | Cache results locally and implement retry logic. |
| Inconsistent AI responses | Standardize prompts and apply validation checks. |
| Missing test coverage | Use CI reports to identify untested components. |
| Incorrect API configuration | Maintain `.env.local` securely and validate keys before deployment. |

---

## 8. Deliverables
- Test Plan (this document)  
- Unit test scripts in `/tests` folder  
- E2E testing report (coming in Test Results section)  
- Automated CI test results visible in GitHub Actions  
- Gemini API usage logs from Google Cloud Console  

---

✅ **Summary:**
This test plan defines the methodology, tools, and schedule for validating the AI Schedule Generator feature.  
It also demonstrates the problem-solving process used to select and configure the Gemini API after evaluating other solutions.  
This ensures our system is robust, accurate, and aligned with user needs.

---

*Prepared by Mero — Sprint 2*
