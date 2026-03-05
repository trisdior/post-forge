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
          // Handle the Brave response structure
          if (json.web && Array.isArray(json.web)) {
            resolve(json.web);
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
  const neighborhoods = [
    'Winnetka IL real estate agents',
    'Oak Brook IL real estate agents',
    'Downtown Chicago real estate agents',
    'Lincoln Park Chicago real estate agents',
    'Highland Park IL real estate agents'
  ];

  const agents = [];

  console.log('🔍 Scanning for real estate agents...\n');

  for (const neighborhood of neighborhoods) {
    console.log(`Searching: ${neighborhood}`);
    const results = await searchBrave(neighborhood);
    
    if (Array.isArray(results)) {
      results.slice(0, 4).forEach((result, i) => {
        const title = result.title || '';
        const description = result.description || '';
        const url = result.url || '';
        
        if (title && url) {
          agents.push({
            name: title.substring(0, 100),
            url: url,
            snippet: description.substring(0, 150),
            area: neighborhood.split(' real')[0]
          });
        }
      });
    }
  }

  // Deduplicate and limit to 20
  const unique = [];
  const seen = new Set();
  
  agents.forEach(agent => {
    if (!seen.has(agent.url)) {
      seen.add(agent.url);
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

  fs.writeFileSync('C:\\Users\\trisd\\clawd\\data\\chicago-agents.json', JSON.stringify(output, null, 2));

  console.log(`\n✅ FOUND ${final.length} AGENTS\n`);
  console.log('=== CHICAGO REAL ESTATE AGENTS (PRIME AREAS) ===\n');
  
  final.forEach((agent, i) => {
    console.log(`${i+1}. ${agent.name}`);
    console.log(`   Area: ${agent.area}`);
    console.log(`   URL: ${agent.url}`);
    console.log(`   Snippet: ${agent.snippet}\n`);
  });

  console.log('\n📊 Saved to: C:\\Users\\trisd\\clawd\\data\\chicago-agents.json');
  console.log('\n=== NEXT STEP: Draft pitching email ===');
}

findAgents().catch(console.error);
