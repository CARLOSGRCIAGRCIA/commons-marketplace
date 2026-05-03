import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isRole } from '../middlewares/authorizationMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { productIdParamValidation } from '../validators/adminValidator.js';

/**
 * Factory function to create and configure the router for admin-related endpoints.
 * @param {object} adminController - The controller containing the handler methods for admin.
 * @param {object} productController - The product controller for delete operations.
 * @returns {express.Router} An Express router instance with all admin routes defined.
 */
export function createAdminRoutes(adminController, productController) {
    const router = express.Router();

    /**
     * @route   GET /api/admin/stats
     * @desc    Get admin dashboard statistics.
     * @access  private
     */
    router.get('/stats', authenticate, isRole('Admin'), (req, res, next) =>
        adminController.getStats(req, res, next),
    );

    /**
     * @route   DELETE /api/admin/products/:id
     * @desc    Delete a product (admin only).
     * @access  private
     */
    router.delete(
        '/products/:id',
        authenticate,
        isRole('Admin'),
        productIdParamValidation(),
        validate,
        (req, res, next) => productController.deleteProduct(req, res, next),
    );

    return router;
}
