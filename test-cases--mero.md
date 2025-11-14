# 🧪 Test Case Development — AI Study Schedule Generator

**Author:** Amr (Mero) Mahmoud  
**Sprint 2 — CPSC 491 (Team AI Study Organizer)**  

---

## 1. Overview

This document outlines the **test cases** developed for the *AI Study Schedule Generator*, a web-based system that generates a **personalized, hour-by-hour weekly study plan** based on real class schedules.

This feature uses the **Google Gemini API** to dynamically create optimized study routines for courses such as **CPSC 351**, **CPSC 491**, and **MATH 338** at CSUF.  
I initially experimented with *Pseudo AI* for schedule generation, but after finding its results inconsistent, I switched to the **Gemini API**, which provided far more accurate and structured responses.  
I successfully integrated Gemini using a free API key, verified on my **Google Cloud dashboard**, and connected it through our backend service.

---

## 2. Test Case Summary

| Test ID | Test Description | Input Data | Expected Output | Actual Output | Result |
|----------|------------------|-------------|------------------|----------------|---------|
| TC-01 | Generate weekly study plan with 3 classes (CPSC 351, CPSC 491, MATH 338) | {CPSC 351: M/W 1:15–2:30PM, CPSC 491: Thu 7–9:45PM, MATH 338: Mon 10–12:45PM} | AI-generated schedule evenly distributed across the week | Detailed hourly plan from Monday–Sunday with balanced workload | ✅ Pass |
| TC-02 | Missing input field (user forgets to enter a class time) | {CPSC 351: blank} | AI should return error message asking for missing info | Gemini displayed “Please input all class days and times.” | ✅ Pass |
| TC-03 | Overlapping classes (conflicting times) | CPSC 351: 1:15–2:30PM, MATH 338: 1:00–2:00PM | AI should detect conflict and adjust | Gemini correctly separated times to avoid overlap | ✅ Pass |
| TC-04 | Invalid API key configuration | No API key or expired key | System should gracefully show connection error | App displayed: “Invalid Gemini API Key” without crash | ✅ Pass |
| TC-05 | Stress test (20+ random classes) | 25 test inputs | AI should handle or truncate results | Gemini returned output for first 10 classes, then truncated | ⚠️ Partial Pass |
| TC-06 | Empty submission (no input at all) | {} | Display “Please enter your classes before generating.” | Correct warning displayed | ✅ Pass |
| TC-07 | API Performance test | Single schedule generation request | Response under 3 seconds | Average 1.7s | ✅ Pass |
| TC-08 | Integration test (frontend → backend → Gemini API) | Clicking “Generate My Study Plan” on UI | Full weekly plan displayed without error | Schedule successfully displayed | ✅ Pass |

---

## 3. Example: Successful Test Case (TC-01)

**Input:**
```json
{
  "CPSC 351": "Mon/Wed 1:15 PM - 2:30 PM",
  "CPSC 491": "Thu 7:00 PM - 9:45 PM",
  "MATH 338": "Mon 10:00 AM - 12:45 PM"
}










Actual Gemini API Output:


Here is a realistic, hour-by-hour weekly study schedule tailored to your classes, focusing on balancing workload, integrating breaks, and varying study methods.

This schedule assumes you start your day around 8:00 AM/9:00 AM and aim for a balance between academic rigor and personal well-being. Remember, this is a template; feel free to adjust times based on your energy levels and personal commitments.

---

## Expert AI Academic Planner: Weekly Study Schedule

**Student Profile:** Full-time, focused on Computer Science and Math.

**Key Principles:**
*   **Active Learning:** Mix reading with problem-solving, coding, and concept mapping.
*   **Spaced Repetition:** Review concepts shortly after class and again later in the week.
*   **Breaks are Essential:** Short breaks every hour or so, and longer breaks for meals and exercise.
*   **Flexibility:** Use "Flex Time" for catching up, deeper dives, or addressing urgent tasks.

---

### **Monday**

*   **8:30 AM - 9:30 AM:** **CPSC 351** - Review last week's lecture notes, pre-read for today's class (topics covered).
*   **9:30 AM - 10:00 AM:** *Breakfast & Prepare for Math Class*
*   **10:00 AM - 12:45 PM:** **MATH 338 — CLASS**
*   **12:45 PM - 1:15 PM:** *Lunch Break / Transition*
*   **1:15 PM - 2:30 PM:** **CPSC 351 — CLASS**
*   **2:30 PM - 3:00 PM:** *Short Break / Grab a snack*
*   **3:00 PM - 4:30 PM:** **CPSC 351** - Immediate post-class review: Summarize today's lecture, review challenging concepts, make a list of questions.
*   **4:30 PM - 6:00 PM:** **MATH 338** - Review today's lecture, start working on initial practice problems for new topics.
*   **6:00 PM - 7:00 PM:** *Dinner Break*
*   **7:00 PM - 8:30 PM:** **CPSC 491** - Research/Reading: Read assigned articles or begin background research for current project.
*   **8:30 PM - 9:30 PM:** **Flex Time / Planning** - Organize notes, plan for Tuesday, light reading, or personal time.

### **Tuesday**

*   **9:00 AM - 10:30 AM:** **CPSC 351** - Problem-solving: Work through practice problems, implement small code examples related to concepts.
*   **10:30 AM - 10:45 AM:** *Short Break*
*   **10:45 AM - 12:15 PM:** **MATH 338** - Deeper dive: Work on more complex problems from the textbook, review proofs.
*   **12:15 PM - 1:15 PM:** *Lunch Break / Exercise*
*   **1:15 PM - 2:45 PM:** **CPSC 491** - Project Work: Brainstorm ideas, outline a project component, or start coding if applicable.
*   **2:45 PM - 3:00 PM:** *Short Break*
*   **3:00 PM - 4:30 PM:** **CPSC 351** - Reading/Advanced Topics: Read textbook chapters, explore supplementary materials related to current topics.
*   **4:30 PM - 6:00 PM:** **MATH 338** - Review past week's topics, identify areas for improvement.
*   **6:00 PM - 7:00 PM:** *Dinner Break*
*   **7:00 PM - 8:30 PM:** **CPSC 491** - Critical analysis: Review project requirements, identify potential challenges, or collaborate if in a team.
*   **8:30 PM - 9:30 PM:** *Wind-down / Hobbies*

### **Wednesday**

*   **9:00 AM - 10:30 AM:** **MATH 338** - Problem-solving: Focus on a specific challenging topic or complete assigned homework.
*   **10:30 AM - 10:45 AM:** *Short Break*
*   **10:45 AM - 12:00 PM:** **CPSC 351** - Pre-class prep: Review notes, try to anticipate questions for today's lecture.
*   **12:00 PM - 1:15 PM:** *Lunch Break / Prepare for Class*
*   **1:15 PM - 2:30 PM:** **CPSC 351 — CLASS**
*   **2:30 PM - 3:00 PM:** *Short Break*
*   **3:00 PM - 4:30 PM:** **CPSC 351** - Post-class review: Process new information, update concept maps, attempt new practice problems.
*   **4:30 PM - 5:30 PM:** **Flex Time / Errands** - Use for administrative tasks, quick reviews, or a short walk.
*   **5:30 PM - 6:30 PM:** *Dinner Break*
*   **6:30 PM - 8:00 PM:** **CPSC 491** - Reading/Discussion Prep: Read articles, prepare questions or discussion points for tomorrow's class.
*   **8:00 PM - 9:00 PM:** **MATH 338** - Quick review or prepare questions for office hours.

### **Thursday**

*   **9:00 AM - 10:30 AM:** **MATH 338** - Targeted practice: Focus on specific problem types or areas you struggled with earlier in the week.
*   **10:30 AM - 10:45 AM:** *Short Break*
*   **10:45 AM - 12:15 PM:** **CPSC 351** - Project/Assignment Work: Begin working on any upcoming CPSC 351 assignments or lab components.
*   **12:15 PM - 1:15 PM:** *Lunch Break*
*   **1:15 PM - 2:45 PM:** **CPSC 491** - Final class prep: Review all assigned readings and notes, consolidate questions for the professor.
*   **2:45 PM - 3:00 PM:** *Short Break*
*   **3:00 PM - 4:30 PM:** **Flex Time / Buffer** - Use for exercise, mental break, or address any urgent tasks.
*   **4:30 PM - 6:30 PM:** *Dinner & Prepare for Evening Class*
*   **7:00 PM - 9:45 PM:** **CPSC 491 — CLASS**
*   **9:45 PM onwards:** *Wind-down / Light Activity* - Avoid intense study after an evening class.

### **Friday**

*   **9:00 AM - 10:30 AM:** **CPSC 491** - Post-class review: Summarize key takeaways from last night's lecture, outline next steps for project work.
*   **10:30 AM - 10:45 AM:** *Short Break*
*   **10:45 AM - 12:15 PM:** **MATH 338** - Weekly review: Go over all topics from the week, ensure understanding, list areas for weekend focus.
*   **12:15 PM - 1:15 PM:** *Lunch Break*
*   **1:15 PM - 2:45 PM:** **CPSC 351** - Catch-up/Project: Work on any CPSC 351 assignment due next week or re-visit difficult concepts.
*   **2:45 PM - 3:00 PM:** *Short Break*
*   **3:00 PM - 4:30 PM:** **CPSC 491** - Dedicated Project Work: Make significant progress on your main CPSC 491 project.
*   **4:30 PM onwards:** *Weekend Start!* - Enjoy personal time, social activities.

### **Saturday**

*   **10:00 AM - 12:00 PM:** **MATH 338** - Deep Dive / Long Problems: Tackle challenging problems or work through proofs that require extended focus.
*   **12:00 PM - 1:00 PM:** *Lunch Break*
*   **1:00 PM - 3:00 PM:** **CPSC 351** - Major Assignment / Lab Work: Dedicate a solid block to any large CPSC 351 projects or labs.
*   **3:00 PM - 3:30 PM:** *Break / Stretch*
*   **3:30 PM - 5:00 PM:** **CPSC 491** - Project Milestone: Work towards a specific milestone or complete a significant portion of your project.
*   **5:00 PM onwards:** *Free Evening* - Socialize, relax, pursue hobbies.

### **Sunday**

*   **10:00 AM - 11:30 AM:** **Weekly Review & Planning** - Review all subjects: What did I learn? What do I need to focus on next week?
*   **11:30 AM - 12:00 PM:** **Preview Week Ahead** - Look at upcoming lectures, readings, and assignment deadlines for all classes.
*   **12:00 PM - 1:00 PM:** *Lunch Break*
*   **1:00 PM - 2:30 PM:** **Flex Time / Buffer** - Use for last-minute review, catching up on any missed study, or personal development.
*   **2:30 PM onwards:** *Relaxation / Errands / Prepare for the week ahead* (e.g., meal prep, organize workspace, get enough rest).

---

**Tips for Success:**

1.  **Be Flexible:** Life happens. If you miss a session, don't panic. Use "Flex Time" or redistribute later in the week.
2.  **Stay Hydrated & Eat Well:** Your brain needs fuel!
3.  **Exercise Regularly:** Even short walks can significantly boost focus and reduce stress.
4.  **Get Enough Sleep:** Crucial for memory consolidation and alertness.
5.  **Utilize Office Hours:** Don't hesitate to ask professors or TAs for clarification.
6.  **Find a Study Buddy:** For CPSC and Math, explaining concepts to someone else is a powerful learning tool.
7.  **Minimize Distractions:** Use website blockers, put your phone away during study sessions.
