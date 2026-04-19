import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir) && process.env.NODE_ENV !== 'test') {
    fs.mkdirSync(logDir, { recursive: true });
}

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...metadata } = info;
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    }),
);

const transports = [new winston.transports.Console({ format: consoleFormat })];

if (process.env.NODE_ENV !== 'test') {
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
            format: fileFormat,
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
            format: fileFormat,
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'http.log'),
            level: 'http',
            maxsize: 5242880,
            maxFiles: 3,
            format: fileFormat,
        }),
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info'),
    levels,
    format: consoleFormat,
    transports,
    silent: process.env.NODE_ENV === 'test',
    exitOnError: false,
});

export const log = {
    error: (message, meta = {}) => {
        logger.error(message, meta);
    },

    warn: (message, meta = {}) => {
        logger.warn(message, meta);
    },

    info: (message, meta = {}) => {
        logger.info(message, meta);
    },

    http: (message, meta = {}) => {
        logger.http(message, meta);
    },

    debug: (message, meta = {}) => {
        logger.debug(message, meta);
    },
};

export default logger;
