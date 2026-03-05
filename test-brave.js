const https = require('https');

const API_KEY = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu';
const query = 'Winnetka real estate agent';

const params = new URLSearchParams({
  q: query,
  count: 5,
});

const url = 'https://api.search.brave.com/res/v1/web/search?' + params.toString();

https.get(url, {
  headers: {
    'X-Subscription-Token': API_KEY,
    'Accept': 'application/json',
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Type of web:', typeof json.web);
    if (json.web && typeof json.web === 'object') {
      console.log('Web keys:', Object.keys(json.web));
      if (Array.isArray(json.web)) {
        console.log('Web is array, length:', json.web.length);
        json.web.slice(0, 2).forEach((r, i) => {
          console.log(`${i+1}. ${r.title}`);
          console.log(`   ${r.url.substring(0, 80)}\n`);
        });
      }
    }
  });
});
