const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const linksFile = path.join(rootDir, 'links.json');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function serveFile(req, res, filePath) {
  const safePath = path.normalize(path.join(rootDir, filePath));
  if (!safePath.startsWith(rootDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(safePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body || '{}'));
    } catch (err) {
      callback(err);
    }
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (url === '/links') {
    if (req.method === 'GET') {
      fs.readFile(linksFile, 'utf8', (err, data) => {
        if (err) return sendJson(res, 500, { error: 'Failed to read links file' });
        try {
          sendJson(res, 200, JSON.parse(data));
        } catch (parseErr) {
          sendJson(res, 500, { error: 'Invalid JSON in links file' });
        }
      });
      return;
    }

    if (req.method === 'POST') {
      parseBody(req, (err, body) => {
        if (err) return sendJson(res, 400, { error: 'Invalid JSON body' });
        const payload = {
          hub_clones: Array.isArray(body.hub_clones) ? body.hub_clones : [],
          hub_external: Array.isArray(body.hub_external) ? body.hub_external : []
        };
        fs.writeFile(linksFile, JSON.stringify(payload, null, 2), 'utf8', writeErr => {
          if (writeErr) return sendJson(res, 500, { error: 'Failed to save links' });
          sendJson(res, 200, { success: true });
        });
      });
      return;
    }

    res.writeHead(405);
    return res.end('Method not allowed');
  }

  let filePath = url === '/' ? '/index.html' : url;
  serveFile(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`Frontend hub server running at http://localhost:${PORT}/`);
});
