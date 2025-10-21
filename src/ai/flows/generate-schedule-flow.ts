/*
'use server';

/**
 * @fileOverview A pseudo (mock) AI flow for generating study schedules based on classes.
 * - No API key required.
 * - Uses pseudo text to simulate an AI-generated weekly schedule.
 */
/*
import { z } from 'genkit';

// Define schema for input (student’s class list)
const GenerateScheduleInputSchema = z.object({
  classes: z.string().min(3, { message: "Please enter at least one valid class name." })
    .describe("Comma-separated list of the student's classes (e.g. 'CPSC 351, MATH 338')."),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

// Define schema for output (the generated schedule text)
const GenerateScheduleOutputSchema = z.object({
  schedule: z.string().describe("The generated weekly study schedule."),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

// --- Mock AI function ---
export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  // Validate input
  const result = GenerateScheduleInputSchema.safeParse(input);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid input: ${msg}`);
  }

  const classList = input.classes.split(',').map(c => c.trim()).filter(Boolean);

  // Simulate delay to look like AI is "thinking"
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create pseudo AI response
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let scheduleText = "📅 Weekly Study Schedule (Pseudo-AI Generated)\n\n";

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const className = classList[i % classList.length] || "Independent Study";
    scheduleText += `${day}: Focus on ${className}\n  - Review notes for 1 hour\n  - Complete one practice problem\n  - Summarize key points\n\n`;
  }

  scheduleText += "🧠 Tip: Rotate subjects and take short breaks every 50 minutes!\n";

  return { schedule: scheduleText };
}
*/


/*
'use server';

/**
 * @file generate-schedule-flow.ts
 * Smart pseudo-AI schedule generator.
 * Integrates with genkit.ts to simulate detailed, subject-specific study plans.
 */
/*
import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const GenerateScheduleInputSchema = z.object({
  classes: z.string().min(3, { message: "Please enter at least one valid class name." }),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const GenerateScheduleOutputSchema = z.object({
  schedule: z.string(),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  const validation = GenerateScheduleInputSchema.safeParse(input);
  if (!validation.success) {
    const msg = validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid input: ${msg}`);
  }

  const prompt = `
  You are a smart study assistant.
  Generate a detailed, hourly weekly study schedule for the following classes:
  Classes: ${input.classes}

  Each day should have hourly slots (8 AM – 5 PM).
  Each subject should include realistic activities (coding, problem solving, reading, writing, etc.).
  The schedule should look professional and easy to read.
  `;

  const schedule = await ai.generate(prompt);
  return { schedule };
}
*/



/*
'use server';

/**
 * AI Schedule Generator Flow (Gemini-based)
 * -----------------------------------------
 * Generates a realistic weekly study plan based on a student's class schedule.
 * - Uses Google Gemini 1.5 Flash (free tier)
 * - Returns specific hour-by-hour study sessions per subject
 */
/*
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScheduleInputSchema = z.object({
  classes: z
    .array(
      z.object({
        name: z.string(),
        days: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .describe("List of the student's classes with times."),
});

export type ScheduleInput = z.infer<typeof ScheduleInputSchema>;

const ScheduleOutputSchema = z.object({
  schedule: z.string().describe("Generated detailed weekly study schedule."),
});

export type ScheduleOutput = z.infer<typeof ScheduleOutputSchema>;

export async function generateSchedule(input: ScheduleInput): Promise<ScheduleOutput> {
  const validation = ScheduleInputSchema.safeParse(input);
  if (!validation.success) {
    const errors = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid input: ${errors}`);
  }

  const prompt = `
You are an expert AI academic planner. Based on the following classes, create a detailed study schedule down to the hour.
For each day, show what the student should study, when, and for how long.
Include realistic, specific activities — for example:
- “Review lecture slides for Biology 101”
- “Solve 5 practice problems for Calculus”
- “Read 10 pages of textbook for Psychology”
- “Take a 15-minute break”

The schedule should be practical and formatted cleanly.

Classes:
${input.classes.map(c => `${c.name} — ${c.days} from ${c.startTime} to ${c.endTime}`).join('\n')}
`;

  const response = await ai.generateText({
    prompt,
    model: 'googleai/gemini-1.5-flash',
  });

  const text = response.text();
  return { schedule: text || "No schedule could be generated." };
}

*/





import { ai } from "@/ai/genkit";
import { z } from "genkit";

/**
 * Schema for class schedule input validation.
 */
export const ScheduleInputSchema = z.object({
  classes: z.array(
    z.object({
      name: z.string().min(1, "Class name required"),
      days: z.string().min(1, "Days required"),
      startTime: z.string().min(1, "Start time required"),
      endTime: z.string().min(1, "End time required"),
    })
  ),
});

export type ScheduleInput = z.infer<typeof ScheduleInputSchema>;

export const ScheduleOutputSchema = z.object({
  schedule: z.string().describe("The detailed weekly study plan."),
});

export type ScheduleOutput = z.infer<typeof ScheduleOutputSchema>;

/**
 * generateScheduleFlow()
 * -----------------------
 * Generates a realistic weekly study plan.
 * Tailored per subject with time blocks and activity diversity.
 */
export async function generateScheduleFlow(input: ScheduleInput): Promise<ScheduleOutput> {
  const valid = ScheduleInputSchema.safeParse(input);
  if (!valid.success) {
    throw new Error("Invalid input: " + JSON.stringify(valid.error.format(), null, 2));
  }

  const prompt = `
You are an expert academic planner. Based on the following student class schedule, 
generate a detailed, hour-by-hour study schedule for the week.

🧭 Instructions:
- Avoid overlapping with class times.
- Include realistic times (morning, afternoon, evening).
- Be subject-specific and actionable. For example:
  - "Summarize lecture slides for CPSC 335"
  - "Solve 5 problems from MATH 338 homework set"
  - "Review lab code for CPSC 351"
- Include short breaks and rest periods.
- Keep a positive, encouraging tone.
- Format neatly by **day of the week**.

Classes:
${input.classes
  .map(
    (c) =>
      `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
  )
  .join("\n")}
`;

  try {
    // ✅ Correct Genkit syntax for Gemini
    const result = await ai.generate({
      model: "googleai/gemini-1.5-flash",
      prompt,
    });

    // Depending on the Genkit version, text output can be under result.output_text or result.text()
    const schedule = result.output_text || result.text?.() || "No schedule generated.";
    return { schedule };
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    throw new Error("Failed to generate schedule with Gemini: " + error.message);
  }
}
