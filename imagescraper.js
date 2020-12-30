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

// Parse command line
let argv = require('minimist')(process.argv.slice(2), {
  string: ['src', 'url', 'output', 'port'],
  default: { port: '8080' },
  alias: { folder: 'src', o: 'output', p: 'port', s: 'src', u: 'url' },
  unknown: (x) => { console.log('imagescraper: Unknown argument', x); process.exit() }
});

let srcDir = argv.src;
let url = argv.url;
let outputDir = argv.output;

// Make sure required args are specified
if (!srcDir.length || !outputDir.length || !url.length) {
  console.log('Usage: imagescraper --src <source dir> --output <output dir> --url <url> [--port <port>]');
  return;
}
// Make sure URL seems valid
if (url.toLowerCase().indexOf("http://") != 0) {
  console.log("imagescraper: URL should start with 'http://'")
  return;
}
// Make sure source directory is valid
if (!fs.existsSync(srcDir)) {
  console.log('imagescraper: Source directory does not exist:', srcDir);
  return;
}
// Make sure output directory is valid
if (!fs.existsSync(outputDir)) {
  console.log('imagescraper: Output directory does not exist:', outputDir);
  return;
}
// Configure port number, or 8080 default as specified in minimist options
let port = parseInt(argv.port, 10);
if (isNaN(port) || port < 1024 || port > 65535) {
  console.log('imagescraper: Invalid port number')
  return;
}

console.log('Serving from folder:', srcDir);
console.log('Port:', port);
console.log('Saving images to:', outputDir);
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
app.use(express.static(srcDir));
// Start server, then start scraper
let server = app.listen(port, async () => {
  console.log('Server listening at: ', port);
  await scrape(url, outputDir);
  server.close(() => {
    console.log('Server closed');
  })
});

// Scrape: Start puppeteer, open URL, parse the DOM, extract images, save images
async function scrape(url, outputDir) {
  console.log('Starting puppeteer');
  // Launch Puppeteer, take care with options for WSL/2
  const browser = await puppeteer.launch({
    headless: true,
    // For WSL2, found this deep in a github discussion
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--no-sandbox',
      '--no-zygote',
      '--single-process'
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
      fs.writeFileSync(path.join(outputDir, fileName), bitmap);
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


