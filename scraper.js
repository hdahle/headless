// Scrape Futureplanet for PNGs
// Heavily inspired by https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
//
// HD 2020
//
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

// Parse command line, get the URL to scrape
let argv = require('minimist')(process.argv.slice(2));
let url = argv.url;
let folder = argv.folder;
if (!url || !folder) {
  console.log('Usage: scraper --url <server url> --folder <output folder>');
  return;
}

// Make sure URL seems valid
if (url.toLowerCase().indexOf("http://") != 0) {
  console.log("URL should start with 'http://'")
  return;
}

// Make sure folder is valid
if (!fs.existsSync(folder)) {
  console.log('Scraper: Folder does not exist:', folder);
  process.exit();
}

console.log('Scraping URL: ', url);
console.log('Saving images to: ', folder);

(async () => {

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

  try {
    console.log('Trying ', url);
    await page.goto(url);
  }
  catch (err) {
    console.log('Unable to open URL:', url);
    process.exit();
  }

  // Evaluate the page, extract all images
  let images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img.fp-image'), (e) => (
      {
        id: e.getAttribute('id'),
        class: e.getAttribute('class'),
        src: e.getAttribute('src')
      }
    ));
  })

  // Save all images, base filename on 'id' tag
  console.log('Images found:', images.length);
  images.forEach(image => {
    const data = image.src.replace(/^data:image\/\w+;base64,/, '');  // remove file meta-data
    const bitmap = new Buffer.from(data, 'base64'); // convert to Buffer for saving
    const fileName = path.join(folder, image.id.replace('-canvas', '').replace('-png', '') + '.png');
    console.log('Saving:', fileName)
    try {
      fs.writeFileSync(fileName, bitmap);
    }
    catch (err) {
      console.log('Error writing file:', fileName, err)
    }
  });

  // We're done
  await browser.close();

})();


