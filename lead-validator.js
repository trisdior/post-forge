/**
 * Lead Quality Validator
 * Filters out contractor ads, junk posts
 */

const XLSX = require('xlsx');

const TRACKER_FILE = 'C:\\Users\\trisd\\clawd\\data\\Valencia-Lead-Tracker.xlsx';

// Criteria for VALID leads (real homeowners asking for help)
const VALID_KEYWORDS = [
  'looking for', 'seeking', 'need', 'help with', 'asking for',
  'do you', 'can you', 'anyone know', 'recommendations', 'does anyone',
  'hire', 'contractor', 'quote', 'estimate', 'asap', 'urgent', 'today',
  'free estimate', 'licensed', 'insured'
];

// Red flags (contractor ads or spam)
const RED_FLAGS = [
  'we do', 'we offer', 'we specialize', 'we handle', 'we can',
  'call us', 'contact us', 'visit us', 'check us out',
  'family owned', 'family run', 'licensed and insured',
  'years of experience', 'trusted professionals',
  'free consultation', 'best in', 'top rated',
  'promotion', 'limited time', 'special offer',
  'kitchen & bathroom remodel', 'full home remodel',
  'home improvements', 'junk removal', 'gutter cleaning'
];

function isValidLead(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check if it's asking FOR help (not offering it)
  const hasValidKeyword = VALID_KEYWORDS.some(k => text.includes(k));
  
  // Check if it's a contractor offering services
  const hasRedFlag = RED_FLAGS.some(r => text.includes(r));
  
  // It's valid if:
  // - It has keywords suggesting they're asking for help
  // - AND it doesn't sound like a contractor ad
  // - AND it's not obviously spam
  
  const isLikelyHomeowner = hasValidKeyword && !hasRedFlag;
  const notSpam = !text.includes('for sale') && !text.includes('buy') && !text.includes('selling');
  
  return isLikelyHomeowner && notSpam;
}

console.log('[Validator] Checking lead quality...\n');

const wb = XLSX.readFile(TRACKER_FILE);
const ws = wb.Sheets['Lead Tracker'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const header = rows.slice(0, 2);
const dataRows = rows.slice(2);

const valid = [];
const invalid = [];

dataRows.forEach((row, idx) => {
  const id = row[0];
  const title = row[4] || '';
  const desc = row[8] || '';
  
  if (!id || id === '') return;
  
  const isValid = isValidLead(title, desc);
  
  if (isValid) {
    valid.push(row);
  } else {
    invalid.push({ id, title: title.substring(0, 60) });
  }
});

console.log(`✅ VALID LEADS (real homeowners asking for help): ${valid.length}`);
valid.forEach(r => {
  console.log(`   ${r[0]} - ${(r[4] || '').substring(0, 50)}`);
});

console.log(`\n❌ INVALID LEADS (contractor ads, spam): ${invalid.length}`);
invalid.forEach(r => {
  console.log(`   ${r.id} - ${r.title}`);
});

// Rebuild tracker with only valid leads
const newWs = XLSX.utils.aoa_to_sheet([...header, ...valid]);
wb.Sheets['Lead Tracker'] = newWs;
XLSX.writeFile(wb, TRACKER_FILE);

console.log(`\n✅ Cleaned. Tracker now has ${valid.length} quality leads.`);
