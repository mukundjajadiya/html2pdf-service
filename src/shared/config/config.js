import path from 'path';

export const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    tempDir: path.join(process.cwd(), 'temp'),
    puppeteer: {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote'
        ]
    }
};
