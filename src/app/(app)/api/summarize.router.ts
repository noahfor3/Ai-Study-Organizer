import { NextResponse } from "next/server";
import { ai } from "@/ai/genkit";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.classes || !Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json({ error: "Invalid or missing class data." }, { status: 400 });
    }

    const prompt = `
You are an expert AI academic planner.
Generate a practical, hour-by-hour weekly study schedule for the student based on these classes.

Each study session should:
- Include realistic times (morning, afternoon, evening)
- Be specific to each subject (e.g., "Review algorithms for CPSC 335" or "Summarize lecture notes for MATH 338")
- Include breaks and variety (short reviews, problem-solving, reading, rest)
- Avoid overlapping with the student's actual class times

Classes:
${body.classes
  .map(
    (c: any) =>
      `📘 ${c.name} — ${c.days} (${c.startTime} to ${c.endTime})`
  )
  .join("\n")}
`;

    // ✅ Call Gemini correctly
    const response = await ai.generate({
      model: "gemini-1.5-flash", // ✅ Correct model name
      prompt,
    });

    const text = response.text ?? "No schedule could be generated.";
    return NextResponse.json({ schedule: text });
  } catch (error: any) {
    console.error("❌ Gemini generation error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while generating the schedule." },
      { status: 500 }
    );
  }
}
