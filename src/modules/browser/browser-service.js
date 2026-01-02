import puppeteer from 'puppeteer';
import { Logger } from '../../shared/utils/logger.js';
import { config } from '../../shared/config/config.js';

export class BrowserService {
    constructor() {
        this.browser = null;
    }

    static getInstance() {
        if (!BrowserService.instance) {
            BrowserService.instance = new BrowserService();
        }
        return BrowserService.instance;
    }

    async init() {
        if (!this.browser || !this.browser.connected) {
            Logger.info('Launching new browser instance...');
            this.browser = await puppeteer.launch({
                headless: config.puppeteer.headless,
                pipe: true,
                args: config.puppeteer.args
            });
            Logger.info('Browser launched successfully');
        }
    }

    async getBrowser() {
        if (!this.browser || !this.browser.connected) {
            await this.init();
        }
        return this.browser;
    }

    async close() {
        if (this.browser) {
            Logger.info('Closing browser instance...');
            await this.browser.close();
            this.browser = null;
        }
    }
}
