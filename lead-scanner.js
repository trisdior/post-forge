/**
 * Brave API Lead Scanner for Valencia Construction
 * Scans Craigslist hourly for hot leads
 * No screen relay needed - runs autonomously
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';
const LEADS_FILE = path.join(__dirname, 'data', 'scanned-leads.json');
const TRACKER_FILE = path.join(__dirname, 'data', 'Valencia-Lead-Tracker.xlsx');

// Search queries for different categories - target homeowners looking for help
const SEARCH_QUERIES = [
  { query: 'site:chicago.craigslist.org "looking for" OR "need" handyman last:day', category: 'Handyman' },
  { query: 'site:chicago.craigslist.org "looking for" OR "need" drywall OR painter last:day', category: 'Drywall, Painting' },
  { query: 'site:chicago.craigslist.org "looking for" kitchen remodel OR "kitchen" "contractor" last:day', category: 'Kitchen' },
  { query: 'site:chicago.craigslist.org "looking for" OR "seeking" bathroom OR tile last:day', category: 'Bathroom' },
  { query: 'site:chicago.craigslist.org "looking for" flooring OR "need" floor last:day', category: 'Flooring' },
  { query: 'site:chicago.craigslist.org "looking for" OR "seeking" contractor last:day', category: 'General Contractor' },
];

/**
 * Query Brave API
 */
async function queryBraveAPI(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 10,
    });

    const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

    https.get(url, {
      headers: {
        'X-Subscription-Token': API_KEY,
        'Accept': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(`Failed to parse Brave response: ${e.message}`);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Extract leads from Brave results
 */
function extractLeads(results, category) {
  const leads = [];
  
  // Brave returns web as array or object with results key
  let items = [];
  if (Array.isArray(results.web)) {
    items = results.web;
  } else if (results.web && Array.isArray(results.web.results)) {
    items = results.web.results;
  } else if (Array.isArray(results.results)) {
    items = results.results;
  }
  
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`  Debug: Got ${items.length || 0} items for ${category}`);
    return leads;
  }

  items.forEach(result => {
    const title = result.title || result.heading || '';
    const url = result.url || result.link || '';
    const description = result.description || result.snippet || '';
    
    if (!url || !title) return;

    // Extract Craigslist post ID from URL
    const match = url.match(/\/(\d+)\.html/);
    if (!match) return;

    const postId = match[1];
    const lead = {
      id: postId,
      title: title,
      url: url,
      description: description,
      category: category,
      source: 'Craigslist (lbg)',
      dateFound: new Date().toISOString().split('T')[0],
      priority: 'Warm', // Could be upgraded to Hot based on keywords
      status: 'New',
    };

    // Check for hot signals (urgent, ASAP, immediate, etc)
    const hotKeywords = ['urgent', 'asap', 'immediate', 'today', 'emergency', 'now'];
    const lowerTitle = title.toLowerCase();
    if (hotKeywords.some(k => lowerTitle.includes(k))) {
      lead.priority = 'Hot';
    }

    leads.push(lead);
  });

  return leads;
}

/**
 * Load existing leads from tracker
 */
function loadExistingLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Failed to load leads file: ${e.message}`);
  }
  return [];
}

/**
 * Deduplicate and save new leads
 */
function saveNewLeads(allLeads, existingLeads) {
  const existingIds = new Set(existingLeads.map(l => l.id));
  const newLeads = allLeads.filter(l => !existingIds.has(l.id));
  
  if (newLeads.length === 0) {
    return { newLeads: [], duplicates: allLeads.length };
  }

  // Append to file
  const combined = [...existingLeads, ...newLeads];
  fs.writeFileSync(LEADS_FILE, JSON.stringify(combined, null, 2));

  return { newLeads, duplicates: allLeads.length - newLeads.length };
}

/**
 * Main scan function
 */
async function scanLeads() {
  console.log(`[${new Date().toISOString()}] Starting lead scan...`);
  
  const results = {
    timestamp: new Date().toISOString(),
    scans: [],
    totalLeadsFound: 0,
    newLeads: 0,
    errors: [],
  };

  const existingLeads = loadExistingLeads();
  const allScannedLeads = [];

  for (const { query, category } of SEARCH_QUERIES) {
    try {
      console.log(`  Scanning: ${category}...`);
      const apiResults = await queryBraveAPI(query);
      const leads = extractLeads(apiResults, category);
      
      allScannedLeads.push(...leads);
      
      results.scans.push({
        category,
        found: leads.length,
        status: 'success',
      });
      
      results.totalLeadsFound += leads.length;
    } catch (error) {
      console.error(`  ✗ Failed to scan ${category}: ${error.message}`);
      results.errors.push({ category, error: error.message });
      results.scans.push({
        category,
        status: 'failed',
        error: error.message,
      });
    }
  }

  // Save all leads and deduplicate
  const saved = saveNewLeads(allScannedLeads, existingLeads);
  results.newLeads = saved.newLeads.length;
  results.duplicates = saved.duplicates;

  // Summary
  const summary = {
    success: results.errors.length === 0,
    timestamp: results.timestamp,
    scansRun: results.scans.length,
    scansFailed: results.errors.length,
    totalLeadsFound: results.totalLeadsFound,
  };

  console.log(`\n✅ Scan complete: ${results.totalLeadsFound} leads found`);
  if (results.errors.length > 0) {
    console.log(`⚠️  ${results.errors.length} scans failed:`);
    results.errors.forEach(e => console.log(`   - ${e.category}: ${e.error}`));
  }

  // Write summary
  fs.writeFileSync(
    path.join(__dirname, 'data', 'scan-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  return results;
}

// Run if called directly
if (require.main === module) {
  scanLeads().catch(console.error);
}

module.exports = { scanLeads };
