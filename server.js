//
// server.js
//
// Banal web server
// 

const express = require('express');
const server = express();
const port = 8080;
const folder = 'html';

console.log('Port: ', port)
console.log('Looking for index.html in folder: ', folder)

server.use(express.static(folder));

server.get("/", (req, res) => {
  res.send('Server running');
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});