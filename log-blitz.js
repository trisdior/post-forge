/**
 * Log the Feb 26 blitz completion to the Lead Tracker
 */

const XLSX = require('xlsx');
const fs = require('fs');

const TRACKER_FILE = 'C:\\Users\\trisd\\clawd\\data\\Valencia-Lead-Tracker.xlsx';

// Read workbook
const wb = XLSX.readFile(TRACKER_FILE);
const ws = wb.Sheets['Lead Tracker'];

// Get all rows
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Add new row for blitz completion
const blitzEntry = [
  '', // ID (auto)
  new Date('2026-02-26').toLocaleDateString(), // Date Found
  'Internal - Blitz', // Source
  'Daily Activity Log', // Category
  'Feb 26, 2026 - Lead Gen Blitz Completed', // Client Name
  '', // Phone
  '', // Email
  'Chicago', // Location
  '3 cold calls made (Chicago Central, Property Hill, SimpliManaged) + 2 Facebook posts published to landlord groups', // Description
  0, // Est Value
  'Completed', // Priority
  'Done', // Status
  new Date('2026-02-26').toLocaleDateString(), // Date Contacted
  '', // Follow-up Date
  '', // Quote Sent
  'Blitz anchor work - morning outreach system activated' // Notes
];

// Append to sheet
XLSX.utils.sheet_add_aoa(ws, [blitzEntry], { origin: -1 });

// Save
XLSX.writeFile(wb, TRACKER_FILE);

console.log('✅ Blitz logged to tracker:');
console.log('   - 3 calls made');
console.log('   - 2 posts published');
console.log('   - Entry added to Lead Tracker for Feb 26, 2026');
console.log('\n📊 Tracker updated at: ' + TRACKER_FILE);
