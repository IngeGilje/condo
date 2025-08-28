// Test plain HTTP proxying

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js at ' + req.url);
});
server.listen(3000, () => console.log('Test server running on http://localhost:3000'));

