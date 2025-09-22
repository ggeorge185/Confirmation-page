// Simple Node.js server for testing API endpoints locally
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import confirmationsHandler from './api/confirmations.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API endpoints
  if (pathname.startsWith('/api/confirmations')) {
    // Add query parameters to req object
    req.query = parsedUrl.query;
    
    // Parse body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
        confirmationsHandler(req, res);
      });
    } else {
      confirmationsHandler(req, res);
    }
    return;
  }

  // Serve static files
  let filePath = path.join(process.cwd(), pathname === '/' ? '/index.html' : pathname);
  
  // Set proper content type
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[ext] || 'text/plain';

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('File not found');
    }
  } catch (error) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});