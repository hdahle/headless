//
// Puppeteer demo for WSL/2 under Windows 10
// Code found at:
// https://github.com/puppeteer/puppeteer/issues/1837#issuecomment-545551412
//
// HD
//

const puppeteer = require('puppeteer');

(async () => {
  //  const browser = await puppeteer.launch();
  console.log(process.env);
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
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 600 })
  //await page.goto('https://futureplanet.eco');
  await page.goto('http://localhost');
  await page.screenshot({ path: 'futureplanet.png' });
  await browser.close();
})();