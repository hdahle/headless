//
// imagescraper.js
//
// Two parts:
// 1. A banal web-server
// 2. An imagescraper using Puppeteer
// 

const express = require('express');
const app = express();
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

// Parse command line, get the name of folder to use
let argv = require('minimist')(process.argv.slice(2));
let folder = argv.folder;
let url = argv.url;
let outputFolder = argv.output;

if (!folder || !outputFolder || !url) {
  console.log('Usage: imagescraper --folder <folder name> --output <output folder> --url <url> [--port <port>]');
  return;
}
// Make sure URL seems valid
if (url.toLowerCase().indexOf("http://") != 0) {
  console.log("imagescraper: URL should start with 'http://'")
  return;
}
// Make sure folder is valid
if (!fs.existsSync(folder)) {
  console.log('imagescraper: Source folder does not exist:', folder);
  return;
}
// Make sure folder is valid
if (!fs.existsSync(outputFolder)) {
  console.log('imagescraper: Output folder does not exist:', outputFolder);
  return;
}
// Configure port number, or 8080 default
let port = argv.port;
if (!port) {
  port = 8080;
}
console.log('Serving from folder:', folder);
console.log('Port:', port);
console.log('Saving images to:', outputFolder);
console.log('Scraping URL:', url);

// Special case: This snippet replaces the existing cb.js file
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

// General case: Serve any files from folder
app.use(express.static(folder));
// Start server, then start scraper
let server = app.listen(port, async () => {
  console.log('Server listening at: ', port);
  await scrape(url, outputFolder);
  server.close(() => {
    console.log('Server closed');
  })
});

// The imagescraper
// Start puppeteer, open URL, parse the DOM, extract images, save images
async function scrape(url, outputFolder) {
  console.log('Starting puppeteer');
  // Launch Puppeteer, take care with options for WSL/2
  const browser = await puppeteer.launch({
    headless: true,
    // For WSL2, found this deep in a github discussion
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
    ]
  });
  // Load page, set viewport to optimal size for charts
  console.log('Set viewport');
  const page = await browser.newPage();
  await page.setViewport({
    width: 990,
    height: 800
  });
  // Open the URL, set a loooong timeout - the 30sec default is too short
  console.log('Opening URL:', url);
  try {
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 120000
    });
  }
  catch (err) {
    console.log('Unable to open URL:', url);
    await browser.close();
    return;
  }
  // Evaluate the page, extract all images
  let images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img.fp-image'), (e) => ({
      id: e.getAttribute('id'),
      class: e.getAttribute('class'),
      src: e.getAttribute('src')
    }));
  })
  // Save all images, base filename on 'id' tag
  console.log('Images found:', images.length);
  images.forEach(async (image) => {
    const data = image.src.replace(/^data:image\/\w+;base64,/, '');  // remove file meta-data
    const bitmap = new Buffer.from(data, 'base64'); // convert to Buffer for saving
    const fileName = image.id.replace('-canvas', '').replace('-png', '') + '.png';
    console.log('Saving:', fileName)
    try {
      fs.writeFileSync(path.join(outputFolder, fileName), bitmap);
    }
    catch (err) {
      console.log('Error writing file:', fileName, err);
      await browser.close();
      return;
    }
  });

  // We're done
  console.log('Scraping done');
  await browser.close();
}


