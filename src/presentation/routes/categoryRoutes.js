import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/authorizationMiddleware.js';

/**
 * Factory function to create and configure the router for category-related endpoints.
 * @param {object} container - The DI container containing the category controller.
 * @returns {express.Router} An Express router instance with all category routes defined.
 */
const categoryRoutes = (container) => {
    const router = express.Router();
    const categoryController = container.categoryController;

    /**
     * @route   POST /api/categories
     * @desc    Create a new category.
     * @access  private
     */
    router.post('/', authenticate, isAdmin, (req, res, next) =>
        categoryController.createCategory(req, res, next),
    );

    /**
     * @route   GET /api/categories
     * @desc    Get all categories.
     * @access  public
     */
    router.get('/', (req, res, next) => categoryController.getAllCategories(req, res, next));

    /**
     * @route   GET /api/categories/main
     * @desc    Get all main categories (without parent).
     * @access  public
     */
    router.get('/main', (req, res, next) => categoryController.getMainCategories(req, res, next));

    /**
     * @route   GET /api/categories/:parentId/subcategories
     * @desc    Get all subcategories of a specific category.
     * @access  public
     */
    router.get('/:parentId/subcategories', (req, res, next) =>
        categoryController.getSubcategories(req, res, next),
    );

    /**
     * @route   GET /api/categories/:id
     * @desc    Get a single category by its ID.
     * @access  public
     */
    router.get('/:id', (req, res, next) => categoryController.getCategoryById(req, res, next));

    /**
     * @route   PUT /api/categories/:id
     * @desc    Update a category by its ID.
     * @access  private
     */
    router.put('/:id', authenticate, isAdmin, (req, res, next) =>
        categoryController.updateCategory(req, res, next),
    );

    /**
     * @route   DELETE /api/categories/:id
     * @desc    Delete a category by its ID.
     * @access  private
     */
    router.delete('/:id', authenticate, isAdmin, (req, res, next) =>
        categoryController.deleteCategory(req, res, next),
    );

    return router;
};

export default categoryRoutes;
