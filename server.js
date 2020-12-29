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
console.log('Selfdestruct: ', selfdestruct === undefined ? 'No' : 'Yes');

// This snippet replaces the existing cb.js file
app.get("/js/cb.js", (req, res) => {
  res.send('Chart.defaults.global.animation.onComplete = (e) => onCompleteCallback(e.chart); \
    function onCompleteCallback(id) { \
    let div = document.getElementById("pngPlaceHolder"); \
    let img = document.createElement("IMG"); \
    img.className = "fp-image"; \
    img.id = id.canvas.id + "-png"; \
    img.src = id.toBase64Image(); \
    div.appendChild(img); \
  }'
  )
});

// All the regular web stuff is served here
app.use(express.static(folder));

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
