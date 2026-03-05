import { NextRequest, NextResponse } from "next/server";
import { updateIdea, deleteIdea } from "@/lib/ideas";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idea = updateIdea(parseInt(id), body);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteIdea(parseInt(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
