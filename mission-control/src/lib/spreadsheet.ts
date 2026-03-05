import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const SPREADSHEET_PATH = 'C:\\Users\\trisd\\clawd\\data\\Valencia-Lead-Tracker.xlsx';

export interface Lead {
  id: number;
  dateFound: string;
  source: string;
  category: string;
  clientName: string;
  phone: string;
  email: string;
  location: string;
  description: string;
  estValue: number;
  priority: string;
  status: string;
  dateContacted: string;
  followUpDate: string;
  quoteSent: string;
  notes: string;
}

export interface Stats {
  totalLeads: number;
  newLeads: number;
  quotesSent: number;
  won: number;
  lost: number;
  pipelineValue: number;
  wonRevenue: number;
  closeRate: number;
  bySource: Record<string, number>;
  byCategory: Record<string, number>;
}

function excelDateToString(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
  }
  return String(val);
}

export function readLeads(): { leads: Lead[]; stats: Stats } {
  if (!fs.existsSync(SPREADSHEET_PATH)) {
    console.log('Spreadsheet not found at:', SPREADSHEET_PATH);
    return { leads: [], stats: emptyStats() };
  }

  const buf = fs.readFileSync(SPREADSHEET_PATH);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const ws = wb.Sheets['Lead Tracker'];
  if (!ws) return { leads: [], stats: emptyStats() };

  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, range: 0 });
  // Row 0 = title, Row 1 = headers, Row 2+ = data
  const leads: Lead[] = [];

  for (let i = 2; i < raw.length; i++) {
    const r = raw[i] as unknown[];
    if (!r || (!r[0] && !r[1])) continue; // skip empty rows (check date col too, lead# may be formula)
    
    const dateFoundStr = excelDateToString(r[1]);
    let priority = String(r[10] || 'Warm');
    
    // Auto-downgrade priority based on age
    if (dateFoundStr) {
      const dateFound = new Date(dateFoundStr);
      const now = new Date();
      const daysSinceFound = Math.floor((now.getTime() - dateFound.getTime()) / (1000 * 60 * 60 * 24));
      
      // Downgrade old stale leads
      if (daysSinceFound > 7 && priority === 'Warm') {
        priority = 'Cold'; // Old warm leads become cold
      } else if (daysSinceFound > 14) {
        priority = 'Cold'; // Very old leads stay cold
      }
    }
    
    leads.push({
      id: Number(r[0]) || i - 1,
      dateFound: dateFoundStr,
      source: String(r[2] || ''),
      category: String(r[3] || ''),
      clientName: String(r[4] || ''),
      phone: String(r[5] || ''),
      email: String(r[6] || ''),
      location: String(r[7] || ''),
      description: String(r[8] || ''),
      estValue: Number(r[9]) || 0,
      priority: priority, // Use auto-adjusted priority
      status: String(r[11] || 'New'),
      dateContacted: excelDateToString(r[12]),
      followUpDate: excelDateToString(r[13]),
      quoteSent: String(r[14] || ''),
      notes: String(r[15] || ''),
    });
  }

  const stats = computeStats(leads);
  return { leads, stats };
}

function emptyStats(): Stats {
  return { totalLeads: 0, newLeads: 0, quotesSent: 0, won: 0, lost: 0, pipelineValue: 0, wonRevenue: 0, closeRate: 0, bySource: {}, byCategory: {} };
}

function computeStats(leads: Lead[]): Stats {
  const s = emptyStats();
  s.totalLeads = leads.length;
  for (const l of leads) {
    const status = l.status.toLowerCase();
    if (status === 'new') s.newLeads++;
    if (status === 'won') { s.won++; s.wonRevenue += l.estValue; }
    if (status === 'lost') s.lost++;
    if (l.quoteSent && l.quoteSent.toLowerCase() === 'yes') s.quotesSent++;
    if (status !== 'won' && status !== 'lost') s.pipelineValue += l.estValue;
    s.bySource[l.source] = (s.bySource[l.source] || 0) + 1;
    s.byCategory[l.category] = (s.byCategory[l.category] || 0) + 1;
  }
  const decided = s.won + s.lost;
  s.closeRate = decided > 0 ? Math.round((s.won / decided) * 100) : 0;
  return s;
}

export function addLead(data: Partial<Lead>): Lead {
  const wb = fs.existsSync(SPREADSHEET_PATH)
    ? XLSX.readFile(SPREADSHEET_PATH)
    : XLSX.utils.book_new();

  let ws = wb.Sheets['Lead Tracker'];
  if (!ws) {
    ws = XLSX.utils.aoa_to_sheet([
      ['VALENCIA CONSTRUCTION — LEAD TRACKER'],
      ['Lead #', 'Date Found', 'Source', 'Category', 'Client Name', 'Phone', 'Email', 'Location', 'Project Description', 'Est. Value', 'Priority', 'Status', 'Date Contacted', 'Follow-Up Date', 'Quote Sent', 'Notes'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Lead Tracker');
  }

  const existing = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  const nextId = existing.length - 1; // subtract header rows
  const today = new Date().toISOString().split('T')[0];

  const newRow = [
    nextId,
    today,
    data.source || '',
    data.category || '',
    data.clientName || '',
    data.phone || '',
    data.email || '',
    data.location || '',
    data.description || '',
    data.estValue || 0,
    data.priority || 'Warm',
    'New',
    '',
    '',
    '',
    data.notes || '',
  ];

  XLSX.utils.sheet_add_aoa(ws, [newRow], { origin: -1 });
  XLSX.writeFile(wb, SPREADSHEET_PATH);

  return {
    id: nextId,
    dateFound: today,
    source: data.source || '',
    category: data.category || '',
    clientName: data.clientName || '',
    phone: data.phone || '',
    email: data.email || '',
    location: data.location || '',
    description: data.description || '',
    estValue: data.estValue || 0,
    priority: data.priority || 'Warm',
    status: 'New',
    dateContacted: '',
    followUpDate: '',
    quoteSent: '',
    notes: data.notes || '',
  };
}
