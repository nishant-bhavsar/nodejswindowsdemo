const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Node.js on Azure</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
        <h1>Hello from Azure Windows Web App!</h1>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><td><b>Node.js Version</b></td><td>${process.version}</td></tr>
          <tr><td><b>Platform</b></td><td>${process.platform}</td></tr>
          <tr><td><b>Architecture</b></td><td>${process.arch}</td></tr>
          <tr><td><b>Hostname</b></td><td>${os.hostname()}</td></tr>
          <tr><td><b>Uptime</b></td><td>${Math.floor(process.uptime())}s</td></tr>
        </table>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Node.js version: ${process.version}`);
});
