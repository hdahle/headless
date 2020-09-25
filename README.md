# Basic image scraping

Uses puppeteer to do server side rendering with headless chromium

Scrapes all images with IMG-tag and class="fp-image" from futureplanet.eco, saves each image to file

## Getting Puppeteer to work under WSL2/Ubuntu

Some digging in github discussions revealed that this is required to get stuff working properly:
````
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
````
