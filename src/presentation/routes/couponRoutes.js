import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

export const createCouponRoutes = (couponController) => {
    const router = express.Router();

    // Simple demo endpoint for Blue/Green: old deployment -> 404, new -> 200.
    // Only requires authentication.
    router.get('/claim', 
        authenticate, 
        couponController.claimCoupon);

    return router;
};
