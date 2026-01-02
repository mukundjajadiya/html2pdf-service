import { BrowserService } from './browser-service.js';
import { AppError } from '../utils/app-error.js';
import { Logger } from '../utils/logger.js';

export class PdfService {
    constructor() {
        this.browserService = BrowserService.getInstance();
    }

    async generateFromHtml(html, outputPath) {
        let page = null;
        try {
            const browser = await this.browserService.getBrowser();
            page = await browser.newPage();

            await page.setContent(html, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
                timeout: 30000
            });

            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true
            });

            Logger.info('PDF generated from HTML', { path: outputPath });
        } catch (error) {
            Logger.error('Failed to generate PDF from HTML', error);
            throw new AppError('PDF generation failed: ' + error.message, 500);
        } finally {
            if (page) await page.close();
        }
    }

    async generateFromUrl(url, outputPath) {
        let page = null;
        try {
            const browser = await this.browserService.getBrowser();
            page = await browser.newPage();

            await page.goto(url, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
                timeout: 30000
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

            Logger.info('PDF generated from URL', { url, path: outputPath });
        } catch (error) {
            Logger.error('Failed to generate PDF from URL', error);
            throw new AppError('PDF generation from URL failed: ' + error.message, 500);
        } finally {
            if (page) await page.close();
        }
    }
}
