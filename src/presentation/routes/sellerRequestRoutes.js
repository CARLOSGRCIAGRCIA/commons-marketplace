import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isRole } from '../middlewares/authorizationMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as sellerRequestValidator from '../validators/sellerRequestValidator.js';

/**
 * Creates seller request routes with dependency injection
 * @param {object} sellerRequestController - Seller request controller
 * @returns {express.Router} Express router
 */
export const createSellerRequestRoutes = (sellerRequestController) => {
    const router = express.Router();

    /**
     * Create a new seller request
     * @name POST /api/v1/seller-requests
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.post(
        '/',
        sellerRequestValidator.createSellerRequestValidation(),
        validate,
        authenticate,
        sellerRequestController.createSellerRequest,
    );

    /**
     * Get all seller requests (with optional status filter)
     * @name GET /api/v1/seller-requests
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.get(
        '/',
        sellerRequestValidator.filterSellerRequestsValidation(),
        validate,
        authenticate,
        isRole('Admin'),
        sellerRequestController.getAllSellerRequests,
    );

    /**
     * Get seller request for authenticated user
     * @name GET /api/v1/seller-requests/me
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.get('/me', authenticate, sellerRequestController.getUserSellerRequest);

    /**
     * Get a specific seller request by ID
     * @name GET /api/v1/seller-requests/:id
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.get(
        '/:id',
        sellerRequestValidator.sellerRequestIdParamValidation(),
        validate,
        authenticate,
        isRole('Admin'),
        sellerRequestController.getSellerRequestById,
    );

    /**
     * Update seller request status (approve/reject)
     * @name PATCH /api/v1/seller-requests/:id/status
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.patch(
        '/:id/status',
        sellerRequestValidator.sellerRequestIdParamValidation(),
        sellerRequestValidator.updateSellerRequestStatusValidation(),
        validate,
        authenticate,
        isRole('Admin'),
        sellerRequestController.updateSellerRequestStatus,
    );

    /**
     * Delete a seller request
     * @name DELETE /api/v1/seller-requests/:id
     * @function
     * @memberof module:routes/sellerRequestRoutes
     * @inner
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    router.delete(
        '/:id',
        sellerRequestValidator.sellerRequestIdParamValidation(),
        validate,
        authenticate,
        isRole('Admin'),
        sellerRequestController.deleteSellerRequest,
    );

    return router;
};
