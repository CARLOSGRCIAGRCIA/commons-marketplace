import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isRole } from '../middlewares/authorizationMiddleware.js';
import { upload } from '../../infrastructure/web/express.js';

/**
 * Factory function to create and configure the router for store-related endpoints.
 * @param {object} storeController - The controller for store operations.
 * @param {Function} canModifyStore - Middleware to check store ownership.
 * @returns {express.Router} An Express router instance.
 */
export function createStoreRoutes(storeController, canModifyStore) {
    const router = express.Router();

    /**
     * @route   GET /api/stores
     * @desc    Get all approved stores (public).
     * @access  public
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.get('/', (req, res, next) => storeController.getAllStores(req, res, next));

    /**
     * @route   POST /api/stores
     * @desc    Create a new store for the authenticated user.
     * @access  private
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.post('/', authenticate, isRole('Seller'), upload.single('logo'), (req, res, next) =>
        storeController.createStore(req, res, next),
    );
    /**
     * @route   GET /api/stores/:id
     * @desc    Get a single store by ID (public).
     * @access  public
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.get('/:id', (req, res, next) => storeController.getStoreById(req, res, next));
    /**
     * @route   GET /api/stores/me
     * @desc    Get all stores owned by the authenticated user.
     * @access  private
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.get('/me', authenticate, isRole('Seller'), (req, res, next) =>
        storeController.getMyStores(req, res, next),
    );

    /**
     * @route   PUT /api/stores/:id
     * @desc    Update a store (owner or admin).
     * @access  private
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.put(
        '/:id',
        authenticate,
        isRole('Seller', 'Admin'),
        canModifyStore,
        upload.single('logo'),
        (req, res, next) => storeController.updateStore(req, res, next),
    );

    /**
     * @route   DELETE /api/stores/:id
     * @desc    Delete a store (owner or admin).
     * @access  private
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {void}
     */
    router.delete(
        '/:id',
        authenticate,
        isRole('Seller', 'Admin'),
        canModifyStore,
        (req, res, next) => storeController.deleteStore(req, res, next),
    );

    /**
     * @route   GET /api/stores/admin/pending
     * @desc    Get all pending stores (admin only).
     * @access  private
     */
    router.get('/admin/pending', authenticate, isRole('Admin'), (req, res, next) =>
        storeController.getPendingStores(req, res, next),
    );

    /**
     * @route   GET /api/stores/admin/status/:status
     * @desc    Get stores by status (admin only).
     * @access  private
     */
    router.get('/admin/status/:status', authenticate, isRole('Admin'), (req, res, next) =>
        storeController.getStoresByStatus(req, res, next),
    );

    /**
     * @route   PATCH /api/stores/admin/:id/status
     * @desc    Update store status (admin only).
     * @access  private
     */
    router.patch('/admin/:id/status', authenticate, isRole('Admin'), (req, res, next) =>
        storeController.updateStoreStatus(req, res, next),
    );

    return router;
}
