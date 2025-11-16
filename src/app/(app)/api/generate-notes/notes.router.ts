import { NextRequest, NextResponse } from 'next/server';
import { generateNotes } from '@/ai/flows/generate-notes-flow';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const notes = await generateNotes(body);
    return NextResponse.json(notes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

