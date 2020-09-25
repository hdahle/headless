//
// Scrape Futureplanet for PNGs
// Heavily inspired by https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
// 
// HD 2020
//
const fs = require('fs');
const puppeteer = require('puppeteer');

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

      await page.goto("http://localhost/");

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


main()
  .then(res => {
    console.log("Results:", res.length, "images");
    res.forEach(image => {
      // remove file meta-data
      let data = image.src.replace(/^data:image\/\w+;base64,/, '');
      let bitmap = new Buffer.from(data, 'base64');
      console.log("Saving file:" + image.name + ".png")
      fs.writeFileSync(image.name + ".png", bitmap);
    })
  })
  .catch(console.error);

