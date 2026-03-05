const https = require('https');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';

async function searchBrave(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 3,
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

async function findURLs() {
  console.log('Searching for URLs...\n');

  // Search for Lombard
  console.log('1. Searching: "Skilled handyman for remodel work" Lombard');
  const lombard = await searchBrave('site:chicago.craigslist.org "remodel work" Lombard');
  if (lombard.length > 0) {
    console.log(`   ✅ Found: ${lombard[0].url}`);
    console.log(`   Title: ${lombard[0].title}\n`);
  } else {
    console.log('   ❌ Not found\n');
  }

  // Search for Matteson
  console.log('2. Searching: "Painting and flooring" Matteson');
  const matteson = await searchBrave('site:chicago.craigslist.org "painting" "flooring" Matteson');
  if (matteson.length > 0) {
    console.log(`   ✅ Found: ${matteson[0].url}`);
    console.log(`   Title: ${matteson[0].title}\n`);
  } else {
    console.log('   ❌ Not found\n');
  }

  // Output URLs
  console.log('=== URLS FOR BOT ===');
  console.log(`Lead 1 (Handyman Lakeview): https://chicago.craigslist.org/chc/lbg/d/chicago-need-handyman-for-simple-home/7917470906.html`);
  console.log(`Lead 2 (Drywall/Paint Barrington): https://chicago.craigslist.org/nwc/lbg/d/barrington-interior-work-drywall-paint/7917464229.html`);
  if (lombard.length > 0) {
    console.log(`Lead 3 (Remodel Lombard): ${lombard[0].url}`);
  }
  if (matteson.length > 0) {
    console.log(`Lead 4 (Painting/Flooring Matteson): ${matteson[0].url}`);
  }
}

findURLs().catch(console.error);
