import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isRole } from '../middlewares/authorizationMiddleware.js';
import { upload } from '../../infrastructure/web/express.js';

/**
 * Factory function to create and configure the router for product-related endpoints.
 * @param {object} productController - The controller for product operations.
 * @param {Function} canModifyProduct - Middleware to check product modification permissions.
 * @returns {express.Router} An Express router instance.
 */
export function createProductRoutes(productController, canModifyProduct) {
    const router = express.Router();

    /**
     * Get all products with optional filters (storeId, categoryId, subCategoryId).
     * @route GET /api/products
     * @access public
     * @param {string} [req.query.storeId] - Filter by store ID
     * @param {string} [req.query.categoryId] - Filter by category ID
     * @param {string} [req.query.subCategoryId] - Filter by sub-category ID
     * @param {number} [req.query.page=1] - Page number
     * @param {number} [req.query.limit=10] - Items per page
     * @param {string} [req.query.sortBy] - Field to sort by
     * @param {string} [req.query.order=asc] - Sort order (asc/desc)
     */
    router.get('/', (req, res, next) => productController.getAllProducts(req, res, next));

    /**
     * Get all products from a specific store.
     * @route GET /api/products/store/:storeId
     * @access public
     * @param {string} req.params.storeId - The store ID
     * @param {number} [req.query.page=1] - Page number
     * @param {number} [req.query.limit=10] - Items per page
     * @param {string} [req.query.sortBy] - Field to sort by
     * @param {string} [req.query.order=asc] - Sort order (asc/desc)
     */
    router.get('/store/:storeId', (req, res, next) =>
        productController.getStoreProducts(req, res, next),
    );

    /**
     * Get a single product by ID.
     * @route GET /api/products/:id
     * @access public
     * @param {string} req.params.id - The product ID
     */
    router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));

    /**
     * Create a new product (seller only, must be associated with an approved store).
     * @route POST /api/products
     * @access private
     * @param {string} req.body.name - Product name
     * @param {string} req.body.description - Product description
     * @param {number} req.body.price - Product price
     * @param {number} req.body.stock - Product stock
     * @param {string} req.body.categoryId - Category ID (required)
     * @param {string} [req.body.subCategoryId] - Sub-category ID (optional)
     * @param {string} req.body.storeId - Store ID (required)
     * @param {object} req.files.mainImage - Main product image (required)
     * @param {object} req.files.additionalImages - Additional images (optional, max 5)
     */
    router.post(
        '/',
        authenticate,
        isRole('Seller'),
        upload.fields([
            { name: 'mainImage', maxCount: 1 },
            { name: 'additionalImages', maxCount: 5 },
        ]),
        (req, res, next) => productController.createProduct(req, res, next),
    );

    /**
     * Update a product (only store owner or admin).
     * @route PUT /api/products/:id
     * @access private
     * @param {string} req.params.id - The product ID
     * @param {string} [req.query.imageAction=keep] - Image action: 'keep', 'add', or 'replace'
     * @param {object} req.files.mainImage - New main image (optional)
     * @param {object} req.files.additionalImages - New additional images (optional)
     */
    router.put(
        '/:id',
        authenticate,
        isRole('Seller', 'Admin'),
        canModifyProduct,
        upload.fields([
            { name: 'mainImage', maxCount: 1 },
            { name: 'additionalImages', maxCount: 5 },
        ]),
        (req, res, next) => productController.updateProduct(req, res, next),
    );

    /**
     * Delete a product (only store owner or admin).
     * @route DELETE /api/products/:id
     * @access private
     * @param {string} req.params.id - The product ID
     */
    router.delete(
        '/:id',
        authenticate,
        isRole('Seller', 'Admin'),
        canModifyProduct,
        (req, res, next) => productController.deleteProduct(req, res, next),
    );

    return router;
}
