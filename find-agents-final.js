const https = require('https');
const fs = require('fs');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';

async function searchBrave(query) {
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
          const json = JSON.parse(data);
          if (json.web && Array.isArray(json.web.results)) {
            resolve(json.web.results);
          } else {
            resolve([]);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function findAgents() {
  const searches = [
    'Winnetka Illinois realtor',
    'Winnetka real estate professional',
    'Oak Brook Illinois realtor',
    'Oak Brook real estate agent',
    'Downtown Chicago real estate agent',
    'Chicago Loop luxury realtor',
    'Lincoln Park Chicago realtor',
    'Lincoln Park real estate professional',
    'Highland Park Illinois realtor',
    'Highland Park real estate agent',
    'North Shore Chicago realtor',
    'Evanston realtor',
    'Chicago residential agent',
    'Top real estate agents Chicago',
    'Luxury realtor Chicago'
  ];

  const agents = [];

  console.log('🔍 Scanning for Chicago real estate agents...\n');

  for (const search of searches) {
    try {
      const results = await searchBrave(search);
      
      if (Array.isArray(results)) {
        results.slice(0, 3).forEach(result => {
          const title = result.title || '';
          const url = result.url || '';
          const description = result.description || '';
          
          if (title && url && (title.toLowerCase().includes('realtor') || title.toLowerCase().includes('agent') || title.toLowerCase().includes('real estate'))) {
            agents.push({
              title: title.substring(0, 110),
              url: url,
              description: description.substring(0, 120),
              search: search
            });
          }
        });
      }
    } catch (e) {
      console.error(`  Error on ${search}:`, e.message);
    }
  }

  // Deduplicate
  const unique = [];
  const seen = new Set();
  
  agents.forEach(agent => {
    const key = agent.title + agent.url;
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
    agents: final
  };

  fs.writeFileSync('C:\\Users\\trisd\\clawd\\data\\chicago-agents-list.json', JSON.stringify(output, null, 2));

  console.log(`✅ FOUND ${final.length} AGENT RESOURCES\n`);
  console.log('=== 20 CHICAGO REAL ESTATE AGENT TARGETS ===\n');
  
  final.forEach((agent, i) => {
    console.log(`${i+1}. ${agent.title}`);
    console.log(`   URL: ${agent.url}`);
    console.log(`   ${agent.description}\n`);
  });

  console.log('\n📊 Saved to: C:\\Users\\trisd\\clawd\\data\\chicago-agents-list.json');
  console.log('\n🎯 NEXT STEP: Draft email pitch for these targets');
}

findAgents().catch(console.error);
