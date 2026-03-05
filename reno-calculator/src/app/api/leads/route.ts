import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

function getLeads() {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const leads = getLeads();
  const lead = {
    id: `lead-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

export async function GET() {
  return NextResponse.json(getLeads());
}
