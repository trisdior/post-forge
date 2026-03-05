const https = require('https');
const fs = require('fs');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';

async function searchBrave(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 15,
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
          const json = JSON.parse(data);
          resolve(json.web || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function findAgents() {
  // More specific searches for individual agents
  const searches = [
    'Winnetka IL top real estate agent',
    'Winnetka realtor team',
    'Oak Brook IL real estate professional',
    'Oak Brook realtor directory',
    'Downtown Chicago residential agent',
    'Chicago Loop real estate broker',
    'Lincoln Park Chicago realtor',
    'Lincoln Park agent team',
    'Highland Park IL real estate agent',
    'Highland Park realtor professional',
    'Evanston Illinois real estate agent',
    'North Shore Chicago realtor',
    'Chicago luxury real estate agent',
    'RE/MAX Chicago agents',
    'Coldwell Banker Chicago',
    'Compass real estate Chicago'
  ];

  const agents = [];

  console.log('🔍 Scanning for Chicago real estate agents (premium areas)...\n');

  for (const search of searches) {
    console.log(`  Searching: "${search}"`);
    const results = await searchBrave(search);
    
    results.slice(0, 2).forEach(result => {
      const title = result.title || '';
      const url = result.url || '';
      
      // Filter for actual agent/brokerage pages
      if (title && url && (url.includes('realtor') || url.includes('realestate') || url.includes('zillow') || url.includes('compass') || url.includes('remax'))) {
        agents.push({
          title: title.substring(0, 120),
          url: url,
          area: search.split(' ')[0]
        });
      }
    });
  }

  // Deduplicate
  const unique = [];
  const seen = new Set();
  
  agents.forEach(agent => {
    const key = agent.url;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(agent);
    }
  });

  const final = unique.slice(0, 20);

  // Save to file
  const output = {
    timestamp: new Date().toISOString(),
    count: final.length,
    agents: final,
    note: 'Agent directories and team pages. Extract individual agent contacts from these.'
  };

  fs.writeFileSync('C:\\Users\\trisd\\clawd\\data\\chicago-agents.json', JSON.stringify(output, null, 2));

  console.log(`\n✅ FOUND ${final.length} AGENT/BROKERAGE PAGES\n`);
  console.log('=== CHICAGO REAL ESTATE AGENT DIRECTORIES ===\n');
  
  final.forEach((agent, i) => {
    console.log(`${i+1}. ${agent.title}`);
    console.log(`   Area: ${agent.area}`);
    console.log(`   Link: ${agent.url}\n`);
  });

  console.log('\n📋 Strategy: Extract individual agent names from these pages');
  console.log('💡 Next: Create LinkedIn search queries for top agents in each area');
}

findAgents().catch(console.error);
