import puppeteer from 'puppeteer';

let browser;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: 'new',
      pipe: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote'
      ]
    });
  }
  return browser;
}

process.on('exit', async () => {
  if (browser) await browser.close();
});

export { getBrowser };
