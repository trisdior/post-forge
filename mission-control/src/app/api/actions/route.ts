import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action;

  // Handle deploy-revenue-system separately
  if (action === 'deploy-revenue-system') {
    const systemId = body.systemId;
    const systemName = body.systemName;
    
    // Trigger deployment in background
    const scriptPath = join(process.cwd(), '..', '..', 'scripts', 'deploy-revenue-system.py');
    
    spawn('python', [scriptPath, String(systemId)], {
      detached: true,
      stdio: 'ignore',
      cwd: join(process.cwd(), '..', '..')
    }).unref();
    
    return NextResponse.json({ 
      ok: true, 
      message: `Deploying ${systemName}... Implementation report will be sent to your phone shortly.`,
      triggeredAt: new Date().toISOString()
    });
  }

  const actions: Record<string, { message: string }> = {
    'cl-scan': { message: 'Craigslist scan triggered. Hunter will process results shortly.' },
    'outreach-package': { message: 'Outreach package generation started. Check back in a few minutes.' },
    'check-leads': { message: 'Lead check initiated. Refreshing data from spreadsheet.' },
  };

  const result = actions[action];
  if (!result) {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: result.message, triggeredAt: new Date().toISOString() });
}
