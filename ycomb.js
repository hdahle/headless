const puppeteer = require('puppeteer');
function run() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
          // '--disable-gpu',
          // '--disable-dev-shm-usage',
          // '--disable-setuid-sandbox',
          // '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
        ]
      }); const page = await browser.newPage();
      await page.goto("https://news.ycombinator.com/");
      let urls = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll('a.storylink');
        items.forEach((item) => {
          results.push({
            url: item.getAttribute('href'),
            class: item.getAttribute('class'),
            text: item.innerText,
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
run().then(console.log).catch(console.error);


