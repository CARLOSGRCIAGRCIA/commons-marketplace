import winston from 'winston';

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

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
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

const transports = [new winston.transports.Console()];

if (process.env.NODE_ENV !== 'test') {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),

        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'debug'),
    levels,
    format,
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
