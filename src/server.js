import app from './app.js';
import { config } from './config/config.js';
import { Logger } from './utils/logger.js';
import { BrowserService } from './services/browser-service.js';
import fs from 'fs/promises';

const startServer = async () => {
    try {
        // Ensure temp dir exists on startup
        await fs.mkdir(config.tempDir, { recursive: true });

        await BrowserService.getInstance().init();

        const server = app.listen(config.port, () => {
            Logger.info(`Server running on port ${config.port} in ${config.env} mode`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            Logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');

            server.close(async () => {
                Logger.info('HTTP server closed.');
                // Close browser
                await BrowserService.getInstance().close();
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

        // Handle unhandled rejections
        process.on('unhandledRejection', (err) => {
            Logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
            shutdown();
        });

    } catch (error) {
        Logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
