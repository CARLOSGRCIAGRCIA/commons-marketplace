import express from 'express';

export const createAuthRoutes = (authController) => {
    const router = express.Router();

    router.post('/register', authController.register);
    router.post('/login', authController.login);
    router.post('/logout', authController.logout);

    return router;
};
