import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isRole } from '../middlewares/authorizationMiddleware.js';

/**
 * Factory function to create and configure the router for admin-related endpoints.
 * @param {object} adminController - The controller containing the handler methods for admin.
 * @returns {express.Router} An Express router instance with all admin routes defined.
 */
export function createAdminRoutes(adminController) {
    const router = express.Router();

    /**
     * @route   GET /api/admin/stats
     * @desc    Get admin dashboard statistics.
     * @access  private
     */
    router.get('/stats', authenticate, isRole('Admin'), (req, res, next) =>
        adminController.getStats(req, res, next),
    );

    return router;
}
