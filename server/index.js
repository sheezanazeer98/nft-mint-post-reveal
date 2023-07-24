const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Set the content type to 'text/html' for HTML responses
  res.setHeader('Content-Type', 'text/html');

  // Read the 'index.html' file from the current directory
  const filePath = path.join(__dirname, 'index.html');

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Error loading the HTML file.');
    } else {
      res.writeHead(200);
      res.end(content);
    }
  });
});

const port = 3001;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
