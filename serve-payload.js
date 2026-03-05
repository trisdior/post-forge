const http = require('http');
const fs = require('fs');
const payload = fs.readFileSync('C:/Users/trisd/clawd/wp-payload.json', 'utf8');
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(payload);
  server.close();
});
server.listen(9876, () => console.log('Server on http://localhost:9876'));
setTimeout(() => { server.close(); process.exit(); }, 30000);
