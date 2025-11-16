'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateScheduleViewInputSchema = z.object({
  userId: z.string().describe("Unique ID of the user to fetch and generate schedule for."),
  focusCourses: z.array(z.string()).optional().describe("Optional list of courses to prioritize in the schedule."),
});

export type GenerateScheduleViewInput = z.infer<typeof GenerateScheduleViewInputSchema>;

const GenerateScheduleViewOutputSchema = z.object({
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    time: z.string(),
    course: z.string(),
    color: z.string(),
  }))
});

export type GenerateScheduleViewOutput = z.infer<typeof GenerateScheduleViewOutputSchema>;

const schedulePrompt = ai.definePrompt({
  name: 'generateScheduleViewPrompt',
  input: { schema: GenerateScheduleViewInputSchema },
  output: { schema: GenerateScheduleViewOutputSchema },
  prompt: `
You are an AI study assistant. 
Generate a personalized study schedule for the user based on their courses and focus areas. 
Each session should include:
- id (unique)
- title
- date (YYYY-MM-DD)
- time (start-end)
- course
- color (any CSS Tailwind color class)

Focus on balance, spacing out sessions, and prioritizing focus courses if provided.

Output in JSON format with "events" array.
`
});

export const generateScheduleViewFlow = ai.defineFlow(
  {
    name: 'generateScheduleViewFlow',
    inputSchema: GenerateScheduleViewInputSchema,
    outputSchema: GenerateScheduleViewOutputSchema,
  },
  async (input) => {
    const { output } = await schedulePrompt(input);
    if (!output || !output.events) {
      return { events: [] };
    }
    return output;
  }
);
/*✅ What this does:

Accepts a userId and optional focus courses.

Returns a list of events in the same format as your mock data.

Can be used in the frontend to replace mockEvents.
*/

// End of file