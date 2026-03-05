import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const QUEUE_PATH = join(process.cwd(), '..', 'data', 'agent-queue.json');

interface QueueItem {
  id: string;
  source: string;
  leadName: string;
  postUrl: string;
  score: number;
  status: string;
  draftReply: string | null;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

function readQueue(): QueueItem[] {
  if (!existsSync(QUEUE_PATH)) return [];
  try {
    const raw = readFileSync(QUEUE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueItem[]): void {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending-approval';

  const queue = readQueue();

  if (status === 'all') {
    return NextResponse.json(queue);
  }

  const filtered = queue.filter(item => item.status === status);
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, editedReply } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    const queue = readQueue();
    const itemIndex = queue.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      queue[itemIndex].status = 'approved';
      if (editedReply) {
        queue[itemIndex].draftReply = editedReply;
      }
      queue[itemIndex].updatedAt = now;
      writeQueue(queue);
      
      // Trigger posting in background (non-blocking)
      // This spawns the karl-post-replies script to actually post to platforms
      const { spawn } = await import('child_process');
      const scriptPath = join(process.cwd(), '..', '..', 'scripts', 'karl-post-replies.py');
      
      spawn('python', [scriptPath, '--limit', '1'], {
        detached: true,
        stdio: 'ignore',
        cwd: join(process.cwd(), '..', '..')
      }).unref();
      
      return NextResponse.json({ 
        success: true, 
        item: queue[itemIndex],
        message: 'Approved & posting to platform...'
      });
    } else {
      queue[itemIndex].status = 'rejected';
    }

    queue[itemIndex].updatedAt = now;
    writeQueue(queue);

    return NextResponse.json({ success: true, item: queue[itemIndex] });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ 
      error: 'Failed to process approval',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
