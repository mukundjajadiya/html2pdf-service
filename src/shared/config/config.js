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
    },
    storage: {
        type: process.env.STORAGE_TYPE || 'local', // 'local' or 's3'
        localPath: path.join(process.cwd(), 'temp'),
        // S3 configuration (for future use)
        s3: {
            bucket: process.env.S3_BUCKET || '',
            region: process.env.S3_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
    }
};
