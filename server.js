import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((request, response) => {
  console.log(`Request: ${request.method} ${request.url}`);

  // Add CORS headers for all requests
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  // Handle favicon.ico request
  if (request.url === '/favicon.ico') {
    response.statusCode = 204; // No content
    response.end();
    return;
  }

  // Normalize file path - parse URL to remove query parameters
  const url = new URL(request.url, `http://${request.headers.host}`);
  let filePath = '.' + url.pathname;
  if (filePath === './') {
    filePath = './src/scripts/tests/video-embed-test-runner.html';
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read the file and respond
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        console.error(`File not found: ${filePath}`);
        fs.readFile('./404.html', (err, content) => {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content || '404 Not Found', 'utf-8');
        });
      } else {
        // Server error
        console.error(`Server error: ${error.code}`);
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success - Add specific CORS headers for font files
      const headers = { 'Content-Type': contentType };
      
      // Add additional CORS headers for font files
      if (extname === '.woff' || extname === '.woff2' || extname === '.ttf' || extname === '.eot' || extname === '.otf') {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET';
        headers['Cache-Control'] = 'public, max-age=31536000'; // Cache fonts for 1 year
      }
      
      response.writeHead(200, headers);
      response.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test page: http://localhost:${PORT}/src/scripts/tests/video-embed-test-runner.html`);
});
