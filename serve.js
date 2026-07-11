// Tiny local dev server for previewing the site. Run: node serve.js
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.js': 'text/javascript' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let p = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!p.startsWith(path.resolve(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8455, () => console.log('serving on http://localhost:8455'));
