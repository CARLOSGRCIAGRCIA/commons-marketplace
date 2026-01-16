import { forbiddenException } from '../exceptions/forbiddenException.js';

/**
 * Middleware to allow only specific roles to access a route.
 * Example usage: isRole('Seller', 'Admin')
 * @param {...string} roles - Allowed roles.
 * @returns {Function} Middleware function.
 */
export const isRole =
    (...roles) =>
    (req, res, next) => {
        const userRole =
            req.user?.app_metadata?.role ||
            req.user?.user_metadata?.role ||
            req.user?.raw_user_meta_data?.role ||
            req.user?.userMetadata?.role;

        if (!userRole || !roles.includes(userRole)) {
            return next(forbiddenException('Insufficient permissions.'));
        }
        next();
    };

/**
 * Factory function to create the isProductOwnerOrAdmin middleware.
 * This middleware checks if the authenticated user is the product owner or an admin.
 * @param {Function} getProductByIdUseCase - Use case to get product by ID (already configured with repository).
 * @returns {Function} Middleware function.
 */
export const createIsProductOwnerOrAdmin = (getProductByIdUseCase) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const userRole =
                req.user?.app_metadata?.role ||
                req.user?.user_metadata?.role ||
                req.user?.raw_user_meta_data?.role ||
                req.user?.userMetadata?.role;

            const productId = req.params.productId || req.params.id;

            const product = await getProductByIdUseCase(productId);

            if (!product) {
                return next(forbiddenException('Product not found.'));
            }

            if (userRole === 'Admin' || product.sellerId === userId) {
                return next();
            }

            return next(forbiddenException('You are not allowed to modify this product.'));
        } catch (error) {
            return next(error);
        }
    };
};

/**
 * Middleware to allow only admin users.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const isAdmin = (req, res, next) => {
    const userRole =
        req.user?.app_metadata?.role ||
        req.user?.user_metadata?.role ||
        req.user?.raw_user_meta_data?.role ||
        req.user?.userMetadata?.role;

    if (userRole !== 'Admin') {
        return next(forbiddenException('Admin access only.'));
    }
    next();
};
