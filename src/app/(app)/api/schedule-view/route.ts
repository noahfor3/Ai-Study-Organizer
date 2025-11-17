import { NextResponse } from "next/server";
import { generateScheduleViewFlow } from "@/ai/flows/generate-schedule-view-flow";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await generateScheduleViewFlow(body);
  return NextResponse.json(result);
}
//Now the client calls this API endpoint, not the server action itself.