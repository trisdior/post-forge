/**
 * Sync scanned leads from Brave API into Excel tracker
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SCANNED_FILE = 'C:\\Users\\trisd\\clawd\\data\\scanned-leads.json';
const TRACKER_FILE = 'C:\\Users\\trisd\\clawd\\data\\Valencia-Lead-Tracker.xlsx';

console.log('[Sync] Starting lead sync...');

// Read scanned leads
const scannedData = JSON.parse(fs.readFileSync(SCANNED_FILE, 'utf8'));
console.log(`[Sync] Loaded ${scannedData.length} scanned leads`);

// Load tracker workbook
const wb = XLSX.readFile(TRACKER_FILE);
const ws = wb.Sheets['Lead Tracker'];

// Get existing leads
const existing = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log(`[Sync] Tracker has ${existing.length - 2} existing leads`);

// Get existing IDs to avoid duplicates
const existingIds = new Set();
for (let i = 2; i < existing.length; i++) {
  const row = existing[i];
  if (row[0]) existingIds.add(String(row[0]));
}

// Add new leads
let addedCount = 0;
scannedData.forEach(lead => {
  if (existingIds.has(String(lead.id))) {
    console.log(`  Skip: ${lead.id} (duplicate)`);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const newRow = [
    lead.id,
    lead.dateFound,
    lead.source,
    lead.category,
    lead.title || '(unnamed)',
    '',  // phone
    '',  // email
    '',  // location
    lead.description,
    0,   // est value
    lead.priority,
    lead.status,
    '',  // date contacted
    '',  // follow-up date
    '',  // quote sent
    lead.url,  // notes (store URL here)
  ];

  XLSX.utils.sheet_add_aoa(ws, [newRow], { origin: -1 });
  addedCount++;
  console.log(`  Added: ${lead.id} - ${lead.category}`);
});

// Save
XLSX.writeFile(wb, TRACKER_FILE);
console.log(`\n✅ Sync complete: ${addedCount} new leads added`);
console.log(`📊 Total leads in tracker: ${existing.length - 2 + addedCount}`);
