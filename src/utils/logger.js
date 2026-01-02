import winston from 'winston';
import { config } from '../config/config.js';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Custom format for local development
const devFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (stack) {
            log += `\n${stack}`;
        }
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return log;
    })
);

// Production format (JSON)
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const winstonLogger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    format: config.env === 'development' ? devFormat : prodFormat,
    defaultMeta: { service: 'pdf-service' },
    transports: [
        new winston.transports.Console()
    ],
});

// Wrapper to maintain compatibility with existing static usage
export class Logger {
    static info(message, meta = {}) {
        winstonLogger.info(message, meta);
    }

    static error(message, error) {
        if (error instanceof Error) {
            winstonLogger.error(message, error);
        } else {
            winstonLogger.error(message, { error });
        }
    }

    static warn(message, meta = {}) {
        winstonLogger.warn(message, meta);
    }

    static debug(message, meta = {}) {
        winstonLogger.debug(message, meta);
    }
}
