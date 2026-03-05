import { NextResponse } from 'next/server';
import { readLeads } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = readLeads();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
