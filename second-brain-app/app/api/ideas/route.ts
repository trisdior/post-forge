import { NextRequest, NextResponse } from "next/server";
import { getIdeas, addIdea } from "@/lib/ideas";

export async function GET() {
  return NextResponse.json(getIdeas());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const idea = addIdea(body);
  return NextResponse.json(idea, { status: 201 });
}
