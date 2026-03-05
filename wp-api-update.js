// This script updates the WordPress page content via REST API
// Run from the browser console or via evaluate

const fs = require('fs');
const content = fs.readFileSync('C:/Users/trisd/clawd/valencia-kitchen-wp-entities.html', 'utf8');
const wpContent = '<!-- wp:html -->\n' + content + '\n<!-- /wp:html -->';
const b64 = Buffer.from(wpContent).toString('base64');

// Write b64 for browser injection
fs.writeFileSync('C:/Users/trisd/clawd/wp-content-entities-b64.txt', b64, 'utf8');
console.log('Base64 length:', b64.length);
console.log('Content preview (decoded):', wpContent.substring(0, 100));
console.log('Phone area:', wpContent.includes('&#128222;') ? 'ENTITY OK' : 'MISSING');
console.log('Em dash:', wpContent.includes('&mdash;') ? 'ENTITY OK' : 'MISSING');
