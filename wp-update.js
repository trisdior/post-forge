// This script will be served as a JS file for the browser to load
const fs = require('fs');
const http = require('http');

const content = fs.readFileSync('C:/Users/trisd/clawd/valencia-kitchen-node.html', 'utf8');
const wpContent = '<!-- wp:html -->\n' + content + '\n<!-- /wp:html -->';
const b64 = Buffer.from(wpContent).toString('base64');

// Split into 4 chunks of ~9K each
const chunkSize = Math.ceil(b64.length / 4);
const chunks = [];
for (let i = 0; i < b64.length; i += chunkSize) {
  chunks.push(b64.substring(i, i + chunkSize));
}

console.log(`Total b64 length: ${b64.length}, chunks: ${chunks.length}, each ~${chunkSize}`);

// Write chunks to individual files
chunks.forEach((chunk, i) => {
  fs.writeFileSync(`C:/Users/trisd/clawd/chunk${i}.txt`, chunk, 'utf8');
  console.log(`Chunk ${i}: ${chunk.length} chars`);
});

// Also output a single JS command to reconstitute and send
console.log('\nDone writing chunks');
