import { notFoundException } from '../exceptions/notFoundException.js';

/**
 * Controller for category operations.
 * @param {object} container - The dependency injection container.
 * @returns {object} The category controller with its methods.
 */
export const categoryController = (container) => {
    const createCategoryUseCase = container.resolve('createCategoryUseCase');
    const getAllCategoriesUseCase = container.resolve('getAllCategoriesUseCase');
    const getCategoryByIdUseCase = container.resolve('getCategoryByIdUseCase');
    const updateCategoryUseCase = container.resolve('updateCategoryUseCase');
    const deleteCategoryUseCase = container.resolve('deleteCategoryUseCase');
    const getMainCategoriesUseCase = container.resolve('getMainCategoriesUseCase');
    const getSubcategoriesUseCase = container.resolve('getSubcategoriesUseCase');

    return {
        /**
         * Creates a new category.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async createCategory(req, res, next) {
            try {
                const { name, slug, description, parent } = req.body;
                const categoryData = { name, slug, description, parent };
                const category = await createCategoryUseCase(categoryData);
                res.status(201).json(category);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Gets all categories.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async getAllCategories(req, res, next) {
            try {
                const categories = await getAllCategoriesUseCase();
                res.status(200).json(categories);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Gets main categories (categories without parent).
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async getMainCategories(req, res, next) {
            try {
                const categories = await getMainCategoriesUseCase();
                res.status(200).json(categories);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Gets subcategories of a specific category.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async getSubcategories(req, res, next) {
            try {
                const { parentId } = req.params;
                const categories = await getSubcategoriesUseCase(parentId);
                res.status(200).json(categories);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Gets a category by ID.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async getCategoryById(req, res, next) {
            try {
                const { id } = req.params;
                const category = await getCategoryByIdUseCase(id);
                if (!category) {
                    throw notFoundException('Category not found');
                }
                res.status(200).json(category);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Updates a category.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async updateCategory(req, res, next) {
            try {
                const { id } = req.params;
                const { name, slug, description, isActive } = req.body;
                const updateData = { name, slug, description, isActive };
                const category = await updateCategoryUseCase(id, updateData);
                if (!category) {
                    throw notFoundException('Category not found');
                }
                res.status(200).json(category);
            } catch (error) {
                next(error);
            }
        },

        /**
         * Deletes a category.
         * @param {object} req - The express request object
         * @param {object} res - The express response object
         * @param {Function} next - The express next middleware function
         */
        async deleteCategory(req, res, next) {
            try {
                const { id } = req.params;
                const category = await deleteCategoryUseCase(id);
                if (!category) {
                    throw notFoundException('Category not found');
                }
                res.status(204).send();
            } catch (error) {
                next(error);
            }
        },
    };
};
