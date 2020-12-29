//
// server.js
//
// Banal web server
// 

const express = require('express');
const app = express();

// Parse command line, get the name of folder to use
let argv = require('minimist')(process.argv.slice(2));
let folder = argv.folder;
if (!folder) {
  console.log('Usage: server --folder <folder name> [--port <port>] [--selfdestruct] ');
  return;
}

// When --selfdestruct is used, server exits after 30 secs
let selfdestruct = argv.selfdestruct;

// Configure port number, or 8080 default
let port = argv.port;
if (!port) {
  port = 8080;
}

// Let's serve some web pages
console.log('Serving: ', folder);
console.log('Port: ', port);
console.log('Selfdestruct: ', selfdestruct);

app.use(express.static(folder));
app.get("/", (req, res) => {
  res.send('Server running');
});

let server = app.listen(port, () => {
  console.log('Server listening at: ', port);
  if (selfdestruct) {
    setTimeout(() => {
      server.close(() => {
        console.log('Server closing')
      })
    }, 30000)
  }
});
