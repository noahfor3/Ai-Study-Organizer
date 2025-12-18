import { NextRequest, NextResponse } from "next/server";
import { generateNotes } from "@/ai/flows/generate-notes-flow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    if (!body.documentContent || !body.noteStyle) {
      return NextResponse.json(
        { error: "Invalid request: 'documentContent' and 'noteStyle' are required" },
        { status: 400 }
      );
    }

    // Call AI flow
    const notesResult = await generateNotes({
      documentContent: body.documentContent,
      noteStyle: body.noteStyle,
      focusArea: body.focusArea
    });

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