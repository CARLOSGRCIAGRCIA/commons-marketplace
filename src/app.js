import express from 'express';
import setupExpress from './infrastructure/web/express.js';
import { createContainer } from './infrastructure/di/container.js';
import { createAuthRoutes } from './presentation/routes/authRoutes.js';
import { createUserRoutes } from './presentation/routes/userRoutes.js';
import categoryRoutes from './presentation/routes/categoryRoutes.js';
import { createProductRoutes } from './presentation/routes/productRoutes.js';
import { createStoreRoutes } from './presentation/routes/storeRoutes.js';
import { createChatRoutes } from './presentation/routes/chatRoutes.js';
import { createAdminRoutes } from './presentation/routes/adminRoutes.js';
import { createReviewRoutes } from './presentation/routes/reviewRoutes.js';
import { createSellerRequestRoutes } from './presentation/routes/sellerRequestRoutes.js';
import { createCouponRoutes } from './presentation/routes/couponRoutes.js';
import { createPushRoutes } from './presentation/routes/pushRoutes.js';
import { verifySupabaseConnection } from './infrastructure/supabase/config/supabaseClient.js';
import connectDB from './infrastructure/database/db.js';
import { createIndexes } from './infrastructure/database/indexes.js';
import { errorHandler } from './presentation/middlewares/errorHandler.js';
import logger from './infrastructure/logger/logger.js';
import { getEnvironmentConfig } from './config/environment.js';
import { authenticate } from './presentation/middlewares/authMiddleware.js';

/**
 * Create Express application
 * @description Initializes and configures the Express application with all routes
 * @returns {Promise<object>} Configured Express application
 */
const createApp = async () => {
    const app = express();
    const envConfig = getEnvironmentConfig();

    const dbConnected = await connectDB();
    if (!dbConnected) {
        throw new Error('Failed to connect to the database. Please check your configuration.');
    }
    logger.info('MongoDB connection established');

    if (envConfig.nodeEnv !== 'test') {
        await createIndexes();
    }

    const supabaseConnected = await verifySupabaseConnection();
    if (!supabaseConnected) {
        throw new Error('Failed to connect to Supabase. Please check your configuration.');
    }
    logger.info('Supabase connection established');

    if (!envConfig.ablyApiKey) {
        logger.warn('ABLY_API_KEY not configured. Chat functionality will not work.');
    } else {
        logger.info('Ably configuration found');
    }

    setupExpress(app);

const container = createContainer();

    const containerV1 = createContainer();

    const v1Router = express.Router();

    v1Router.use('/auth', createAuthRoutes(containerV1.authController));
    v1Router.use('/users', createUserRoutes(containerV1.userController));
    v1Router.use('/categories', categoryRoutes(containerV1));
    v1Router.use('/products', createProductRoutes(containerV1.productController, containerV1.canModifyProduct));
    v1Router.use('/stores', createStoreRoutes(containerV1.storeController, containerV1.canModifyStore));
    v1Router.use('/admin', createAdminRoutes(containerV1.adminController));
    v1Router.use('/chat', createChatRoutes(containerV1.chatController));
    v1Router.use('/reviews', createReviewRoutes(containerV1.reviewController));
    v1Router.use('/seller-requests', createSellerRequestRoutes(containerV1.sellerRequestController));
    v1Router.use('/coupons', createCouponRoutes(containerV1.couponController));

    app.use('/api/v1', v1Router);

    app.use((req, res, next) => {
        if (req.path.startsWith('/api/') && !req.path.startsWith('/api/v1')) {
            logger.warn('Deprecated API endpoint accessed', {
                path: req.originalUrl,
                method: req.method,
                ip: req.ip,
            });
            res.set('Deprecation', 'true');
            res.set('Link', '<https://api.example.com/api/v1' + req.path + '>; rel="v1"');
        }
        next();
    });

    app.use('/api/auth', createAuthRoutes(container.authController));
    app.use('/api/users', createUserRoutes(container.userController));
    app.use('/api/categories', categoryRoutes(container));
    app.use(
        '/api/products',
        createProductRoutes(container.productController, container.canModifyProduct),
    );
    app.use('/api/stores', createStoreRoutes(container.storeController, container.canModifyStore));
    app.use('/api/admin', createAdminRoutes(container.adminController));
    app.use('/api/chat', createChatRoutes(container.chatController));
    app.use('/api/reviews', createReviewRoutes(container.reviewController));
    app.use('/api/seller-requests', createSellerRequestRoutes(container.sellerRequestController));
    app.use('/api/coupons', createCouponRoutes(container.couponController));
    app.use('/api/push', authenticate, createPushRoutes());

    app.use((req, res) => {
        logger.warn('Route not found', {
            path: req.originalUrl,
            method: req.method,
            ip: req.ip,
        });

        const availableRoutes = [
            '/api/v1/auth',
            '/api/v1/users',
            '/api/categories',
            '/api/products',
            '/api/stores',
            '/api/chat',
            '/api/reviews',
            '/api/coupons',
            '/api/seller-requests',
            '/api/admin',
            '/health',
        ];

        if (envConfig.enableSwagger) {
            availableRoutes.push('/api-docs');
        }

        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl,
            method: req.method,
            availableRoutes,
        });
    });

    app.use(errorHandler);

    app.use((error, req, res, next) => {
        logger.error('Unhandled error', {
            message: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
        });

        const isDevelopment = envConfig.nodeEnv === 'development';

        res.status(error.status || 500).json({
            error: error.status ? error.message : 'Internal server error',
            ...(isDevelopment && {
                stack: error.stack,
                details: error.details,
            }),
        });
    });

    return app;
};

export default createApp;
