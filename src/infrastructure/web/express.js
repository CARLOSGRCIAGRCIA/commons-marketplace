import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { swaggerDocs } from '../swagger/swagger.config.js';
import { getEnvironmentConfig } from '../../config/environment.js';

const storage = multer.memoryStorage();

/**
 * Configure multer for file uploads
 * @description Multer configuration for image uploads
 */
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

/**
 * Configure CORS options
 * @description Sets up CORS configuration based on environment
 * @returns {object} CORS configuration object
 */
const getCorsOptions = () => {
    const envConfig = getEnvironmentConfig();
    const allowedOrigins = envConfig.corsOrigins;

    return {
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS rejected origin: ${origin}`);
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 86400,
    };
};

/**
 * Setup Express application
 * @description Configures Express middleware and base routes
 * @param {object} app - Express application instance
 * @returns {void}
 */
const setupExpress = (app) => {
    const envConfig = getEnvironmentConfig();
    const corsOptions = getCorsOptions();

    app.use(cors(corsOptions));

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
            crossOriginEmbedderPolicy: false,
        }),
    );

    if (envConfig.nodeEnv !== 'production') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (envConfig.enableSwagger) {
        swaggerDocs(app);
    }

    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: envConfig.nodeEnv,
            service: 'commons-marketplace',
            supabase: 'connected',
            mongodb: 'connected',
            ably: envConfig.ablyApiKey ? 'configured' : 'not configured',
        });
    });

    app.get('/', (req, res) => {
        const endpoints = {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories',
            products: '/api/products',
            chat: '/api/chat',
            reviews: '/api/reviews',
            sellerRequests: '/api/seller-requests',
            admin: '/api/admin',
        };

        if (envConfig.enableSwagger) {
            endpoints.docs = '/api-docs';
        }

        res.json({
            message: 'CommonMarketplace API Service',
            version: '1.0.0',
            environment: envConfig.nodeEnv,
            status: 'running',
            endpoints,
        });
    });
};

export default setupExpress;
