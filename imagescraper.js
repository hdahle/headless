//
// Scrape Futureplanet for PNGs
// Heavily inspired by https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
// 
// HD 2020
//
const fs = require('fs');
const puppeteer = require('puppeteer');

// Parse command line, get the URL to scrape
let argv = require('minimist')(process.argv.slice(2));
let url = argv.url;
if (!url) {
  console.log('Usage: imagescraper --url <server url>');
  return;
}
// Make sure URL seems valid
if (url.toLowerCase().indexOf("http://") != 0) {
  console.log("URL should start with 'http://'")
  return;
}
console.log("Using URL: " + url);

// 
// Launch puppeteer
// Open the URL
// Return a list of DOM elements "img" with class ".fp-image"
//
function main() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        // For WSL2, found this deep in a github discussion
        ignoreDefaultArgs: ['--disable-extensions'],
        // For WSL2, found this deep in a github discussion
        args: [
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
        ]
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 990,
        height: 800
      })
      await page.goto(url);

      let urls = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll('img.fp-image');
        items.forEach((item) => {
          results.push({
            name: item.getAttribute('id'),
            class: item.getAttribute('class'),
            src: item.getAttribute('src')
          });
        });
        return results;
      })
      browser.close();
      return resolve(urls);
    } catch (e) {
      return reject(e);
    }
  })
}

// 
// For each image, save to disc
//
main()
  .then(res => {
    console.log("Results:", res.length, "images");
    res.forEach(image => {
      // remove file meta-data
      let data = image.src.replace(/^data:image\/\w+;base64,/, '');
      // convert to Buffer for saving
      let bitmap = new Buffer.from(data, 'base64');
      // change filename from 'name-canvas-png' til 'name.png'
      let fileName = image.name.replace('-canvas', '').replace('-png', '') + '.png'
      console.log("Saving file:" + fileName)
      fs.writeFileSync(fileName, bitmap);
    })
  })
  .catch(console.error);

