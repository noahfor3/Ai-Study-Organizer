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