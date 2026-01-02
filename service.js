import { getBrowser } from "./puppeteer-browser.js";

async function htmlToPdf(html, outputPath) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });

  } finally {
    await page.close();
  }
}

async function urlToPdf(url, outputPath) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

  } finally {
    await page.close();
  }
}

export { htmlToPdf, urlToPdf };
