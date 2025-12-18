/*
import { NextRequest, NextResponse } from "next/server";
import { generateNotesFlow } from "@/ai/flows/generate-notes-flow"; // Adjust path

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    if (!body.classes || !Array.isArray(body.classes)) {
      return NextResponse.json(
        { error: "Invalid request: 'classes' array is required" },
        { status: 400 }
      );
    }

    // Call AI flow
    const notesResult = await generateNotesFlow({ classes: body.classes });

    if (!notesResult?.notes) {
      return NextResponse.json(
        { error: "AI failed to generate notes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notesResult.notes });
  } catch (err: any) {
    console.error("[generate-notes API error]", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
//Now the client calls this API endpoint, not the server action itself.

*/

/* Revised code using Gemini model directly
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key (same pattern as generate-schedule)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Basic input validation (same style)
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // ✅ Prompt generation
    const prompt = `
You are an expert academic assistant.
Generate clear, concise, and well-structured study notes for the following classes.

Each set of notes should:
- Use headings and bullet points
- Focus on key concepts, definitions, and examples
- Be easy to review for exams

Classes:
${body.classes.map((c: any) => `📘 ${c.name}`).join("\n")}
`;

    // ✅ Use the SAME Gemini model style that already works for you
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ Generate notes
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while generating the notes.",
      },
      { status: 500 }
    );
  }
}

*/


/*
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class list." },
        { status: 400 }
      );
    }

    if (body.classes.some((c: any) => !c.name || c.name.trim() === "")) {
      return NextResponse.json(
        { error: "All classes must have a valid name." },
        { status: 400 }
      );
    }

    // ✅ Prompt for BEAUTIFUL, STUDENT-FRIENDLY NOTES
    const prompt = `
You are an expert academic note-taking assistant with deep knowledge of university courses.

Generate detailed, well-organized study notes for a college student. 
The notes must be:
- Clear, concise, and easy to study from
- Structured with headings, subheadings, bullet points, and short explanations
- Tailored to the specific course content and skills required
- Written in a professional yet student-friendly tone

For each class:
1. Start with the class code and full course name as a clear heading
2. Provide:
   - A brief description of the class (what it covers, its goals, and learning outcomes)
   - Key concepts and definitions that students must know
   - Important assignments, projects, or exercises typically required
   - Example problems, coding exercises, or case studies if relevant
   - Tips for studying, common pitfalls, and what professors usually expect
3. Use markdown formatting (## for class headings, ### for sections, bullets for lists)

Classes:
${body.classes.map((c: any) => `- ${c.name}`).join("\n")}

Notes must be accurate, actionable, and reflect what a student actually needs to succeed in each course.
`;


    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ Generate notes
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini Notes Error:", error);

    // ✅ Handle quota / rate-limit errors explicitly
    if (error?.message?.includes("429")) {
      return NextResponse.json(
        {
          error:
            "Daily AI usage limit reached. Please wait a bit or try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while generating notes.",
      },
      { status: 500 }
    );
  }
}
*/

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Retry Gemini calls on quota (429) and overload (503)
 */
async function generateWithRetry(
  model: any,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  let attempt = 0;
  let delay = 15_000; // 15 seconds

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      const msg = error?.message || "";

      if (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("503") ||
        msg.includes("overloaded")
      ) {
        attempt++;
        console.warn(
          `⚠️ Gemini busy (attempt ${attempt}/${maxRetries}). Retrying in ${
            delay / 1000
          }s`
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error; // unknown error
      }
    }
  }

  throw new Error(
    "AI service is temporarily unavailable. Please try again later."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class list." },
        { status: 400 }
      );
    }

    if (body.classes.some((c: any) => !c.name || c.name.trim() === "")) {
      return NextResponse.json(
        { error: "All classes must have a valid name." },
        { status: 400 }
      );
    }

    // ✅ Prompt (unchanged – already excellent)
    const prompt = `
You are an expert academic note-taking assistant with deep knowledge of university courses.

Generate detailed, well-organized study notes for a college student. 
The notes must be:
- Clear, concise, and easy to study from
- Structured with headings, subheadings, bullet points, and short explanations
- Tailored to the specific course content and skills required
- Written in a professional yet student-friendly tone

For each class:
1. Start with the class code and full course name as a clear heading
2. Provide:
   - A brief description of the class (what it covers, its goals, and learning outcomes)
   - Key concepts and definitions that students must know
   - Important assignments, projects, or exercises typically required
   - Example problems, coding exercises, or case studies if relevant
   - Tips for studying, common pitfalls, and what professors usually expect
3. Use markdown formatting (## for class headings, ### for sections, bullets)

Classes:
${body.classes.map((c: any) => `- ${c.name}`).join("\n")}

Notes must be accurate, actionable, and reflect what a student actually needs to succeed in each course.
`;

    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // ✅ SAFE generation (fixes your 503 crash)
    const text = await generateWithRetry(model, prompt);

    return NextResponse.json({
      notes: text || "No notes could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini Notes Error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "The AI service is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
