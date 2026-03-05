import { NextResponse } from 'next/server';
import { readLeads } from '@/lib/spreadsheet';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

interface QueueItem {
  id: string;
  status: string;
  updatedAt: string;
}

function readAgentQueue(): QueueItem[] {
  const queuePath = join(process.cwd(), '..', 'data', 'agent-queue.json');
  if (!existsSync(queuePath)) return [];
  try {
    const raw = readFileSync(queuePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET() {
  let stats;
  try {
    const result = readLeads();
    stats = result.stats;
  } catch {
    stats = { totalLeads: 0, pipelineValue: 0, newLeads: 0 };
  }

  const queue = readAgentQueue();
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  // Queue stats
  const queueNew = queue.filter(i => i.status === 'new').length;
  const queueDrafting = queue.filter(i => i.status === 'drafting').length;
  const queuePending = queue.filter(i => i.status === 'pending-approval').length;
  const queueApproved = queue.filter(i => i.status === 'approved').length;
  const queueTotal = queue.length;

  // Karl stats
  const today = new Date().toISOString().split('T')[0];
  const sentToday = queue.filter(i => i.status === 'sent' && i.updatedAt?.startsWith(today)).length;

  return NextResponse.json({
    agents: [
      {
        name: 'Steve',
        emoji: '🔧',
        role: 'Operations Manager',
        status: 'Online',
        detail: `Managing Hunter + Karl | ${queueTotal} items in queue (${queuePending} pending approval)`,
      },
      {
        name: 'Hunter',
        emoji: '🎯',
        role: 'Lead Generation',
        status: 'Online',
        detail: `Last scan: ${now}`,
        leadsToday: stats.newLeads,
      },
      {
        name: 'Karl',
        emoji: '🤝',
        role: 'Closer / Engagement',
        status: 'Online',
        detail: `${queuePending} pending approval | ${sentToday} sent today | ${queueNew + queueDrafting} in draft queue`,
      },
    ],
  });
}
