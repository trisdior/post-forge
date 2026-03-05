/**
 * Remove duplicate leads from Excel tracker
 */

const XLSX = require('xlsx');
const path = require('path');

const TRACKER_FILE = 'C:\\Users\\trisd\\clawd\\data\\Valencia-Lead-Tracker.xlsx';

console.log('[Dedupe] Starting deduplication...');

const wb = XLSX.readFile(TRACKER_FILE);
const ws = wb.Sheets['Lead Tracker'];

// Get all rows
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log(`[Dedupe] Total rows: ${rows.length}`);

// Keep header (rows 0-1)
const header = rows.slice(0, 2);
const dataRows = rows.slice(2);

// Deduplicate by ID (column 0)
const seen = new Set();
const deduped = [];

dataRows.forEach((row, idx) => {
  const id = String(row[0]);
  if (!id || id === '') return; // skip empty rows
  
  if (seen.has(id)) {
    console.log(`  Removing duplicate: ${id}`);
    return;
  }
  
  seen.add(id);
  deduped.push(row);
});

// Rebuild sheet
const newWs = XLSX.utils.aoa_to_sheet([...header, ...deduped]);
wb.Sheets['Lead Tracker'] = newWs;

XLSX.writeFile(wb, TRACKER_FILE);

console.log(`✅ Deduplication complete`);
console.log(`   Removed: ${dataRows.length - deduped.length} duplicates`);
console.log(`   Remaining: ${deduped.length} unique leads`);
