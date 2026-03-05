const https = require('https');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';

async function searchFinance() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: 'tech layoffs February 2026 market impact',
      count: 5,
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
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

searchFinance().then(result => {
  console.log('=== LATEST FINANCE NEWS ===\n');
  
  if (result.web && Array.isArray(result.web)) {
    result.web.slice(0, 5).forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
      console.log(`   ${item.description}`);
      console.log(`   ${item.url}\n`);
    });
  } else {
    console.log('Response:', JSON.stringify(result, null, 2));
  }
}).catch(console.error);
