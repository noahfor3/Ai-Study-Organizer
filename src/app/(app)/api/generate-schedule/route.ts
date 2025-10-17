import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini using environment key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic input validation
    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing class data." },
        { status: 400 }
      );
    }

    // Prompt generation
    const prompt = `
You are an expert AI academic planner.
Generate a realistic, hour-by-hour weekly study schedule for the student based on these classes.

Each study session should:
- Include realistic time blocks (morning, afternoon, evening)
- Be subject-specific (e.g., "Review algorithms for CPSC 335" or "Summarize lecture notes for MATH 338")
- Include variety and breaks (short reviews, problem-solving, reading, rest)
- Avoid class times and balance workload through the week
- Clearly format each day with time intervals

Classes:
${body.classes
  .map((c: any) => `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`)
  .join("\n")}
`;

    // ✅ Use the correct Gemini model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // ✅ Generate the schedule
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      schedule: text || "No schedule could be generated.",
    });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while generating the schedule.",
      },
      { status: 500 }
    );
  }
}
