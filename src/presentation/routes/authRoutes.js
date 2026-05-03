import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import * as AuthValidator from '../validators/authValidator.js';

export const createAuthRoutes = (authController) => {
    const router = express.Router();

    router.post(
        '/register',
        authLimiter,
        AuthValidator.registerValidation(),
        validate,
        authController.register,
    );
    router.post(
        '/login',
        authLimiter,
        AuthValidator.loginValidation(),
        validate,
        authController.login,
    );
    router.post('/logout', authenticate, authController.logout);
    router.post(
        '/refresh',
        AuthValidator.refreshTokenValidation(),
        validate,
        authController.refreshToken,
    );

    return router;
};
