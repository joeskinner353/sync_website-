const http = require('http');
const fs = require('fs');
const path = require('path');

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

  // Handle favicon.ico request
  if (request.url === '/favicon.ico') {
    response.statusCode = 204; // No content
    response.end();
    return;
  }

  // Normalize file path
  let filePath = '.' + request.url;
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
      // Success
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test page: http://localhost:${PORT}/src/scripts/tests/video-embed-test-runner.html`);
});
