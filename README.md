# Basic image scraping

Uses puppeteer to do server side rendering with headless chromium

Scrapes all images with IMG-tag and class="fp-image" from futureplanet.eco, saves each image to file

## Why

The Telegram bot uses the PNG charts

## Usage

To scrape all the images in futureplanet.eco:
````
node imagescraper.js --folder html --output /tmp --url http://localhost:8080
````
Key assumptions:

````html```` is a link to the web-server directory, i.e. ````/var/www/html```` or ````/home/bitnami/htdocs````

The output folder should point to the folder where the Telegram bot looks for files, e.g. ````/home/bitnami/tbot/img````

### On the use of ports:

Default port is 8080. Other ports may be used in the following inelegant way:
````
node imagescraper.js --folder html --output /tmp --url http://localhost:8088 --port 8088
````

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
## Note
This has been tested on Ubuntu 16.04 LTS (AWS/Lightsail) and Ubuntu 18.04 LTS (WSL2).
