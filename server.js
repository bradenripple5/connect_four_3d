    const http = require('http');

    const server = http.createServer((req, res) => {
      // Set the response HTTP header
      res.writeHead(200, { 'Content-Type': 'text/plain' });

      // Send the response body
      res.end('Hello, World!\n');
    });

    const PORT = 3000;

    // Listen on a specific port
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
