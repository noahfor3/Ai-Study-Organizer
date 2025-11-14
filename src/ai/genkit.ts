/*
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
*/

// --- Pseudo (mock) AI flow for generating study schedules ---


/**
 * @file genkit.ts
 * Local mock AI (no external API required).
 * Simulates intelligent responses for scheduling and study assistance.
 */


/*
export interface PseudoAIOptions {
  temperature?: number;
  model?: string;
}

export class PseudoAI {
  private temperature: number;
  private model: string;

  constructor(options?: PseudoAIOptions) {
    this.temperature = options?.temperature ?? 0.7;
    this.model = options?.model ?? "mock-genkit-v1";
  }

  async generate(prompt: string): Promise<string> {
    console.log("🧠 Mock AI generating:", prompt.slice(0, 60) + "...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (prompt.toLowerCase().includes("schedule")) {
      return this.generateStudySchedule(prompt);
    }
    return "Generated placeholder text.";
  }

  private generateStudySchedule(prompt: string): string {
    const subjects = this.extractSubjects(prompt);
    const baseHours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let schedule = "📘 **Personalized Weekly Study Schedule**\n\n";

    for (const day of days) {
      schedule += `### ${day}\n`;
      subjects.forEach((subject, i) => {
        const start = baseHours[i % baseHours.length];
        const end = baseHours[(i + 1) % baseHours.length];
        const task = this.getActivityBySubject(subject);
        schedule += `🕒 ${start}–${end}: **${subject}** → ${task}\n`;
      });
      schedule += "\n";
    }
    return schedule + "💡 Remember: take 10-min breaks every hour!";
  }

  private extractSubjects(prompt: string): string[] {
    const match = prompt.match(/classes?:\s*(.*)/i);
    return match && match[1]
      ? match[1].split(",").map((s) => s.trim()).filter(Boolean)
      : ["Independent Study"];
  }

  private getActivityBySubject(subject: string): string {
    const name = subject.toLowerCase();
    if (name.includes("cpsc")) return "Practice algorithms, debug code, and review system design notes.";
    if (name.includes("math")) return "Solve problem sets and review proofs.";
    if (name.includes("engl")) return "Draft essays and analyze assigned readings.";
    if (name.includes("hist")) return "Review historical timelines and summarize key events.";
    if (name.includes("bio") || name.includes("chem")) return "Review lab notes and study experimental methods.";
    if (name.includes("psych")) return "Summarize theories and analyze study data.";
    return "Review notes and prepare for upcoming assignments.";
  }
}

export const ai = new PseudoAI();

*/

/* --- Real Genkit AI setup (disabled for now) ---

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // 👈 Uses your env key securely
    }),
  ],
  model: 'googleai/gemini-1.5-flash', // Fast & free tier
});
// model: 'googleai/gemini-2.0-flash', // More advanced (free tier)


*/


/*
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-1.5-flash",
});
// model: 'googleai/gemini-2.0-flash', // More advanced (free tier)

*/


import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// ✅ Log whether your key is loaded
console.log("✅ Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠️ WARNING: No GEMINI_API_KEY found in environment. Check your .env.local file!"
  );
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: "googleai/gemini-1.5-flash",
});
