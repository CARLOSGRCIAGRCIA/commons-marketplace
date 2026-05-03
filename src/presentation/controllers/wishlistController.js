/**
 * Factory function to create a wishlist controller.
 * @param {object} dependencies - The dependencies object.
 * @param {Function} dependencies.getWishlistUseCase - Use case for getting wishlist.
 * @param {Function} dependencies.addToWishlistUseCase - Use case for adding to wishlist.
 * @param {Function} dependencies.removeFromWishlistUseCase - Use case for removing from wishlist.
 * @param {Function} dependencies.checkWishlistUseCase - Use case for checking wishlist.
 * @param {Function} dependencies.clearWishlistUseCase - Use case for clearing wishlist.
 * @returns {object} Wishlist controller methods.
 */
export function createWishlistController({
    getWishlistUseCase,
    addToWishlistUseCase,
    removeFromWishlistUseCase,
    checkWishlistUseCase,
    clearWishlistUseCase,
}) {
    return {
        /**
         * Handles the request to get the user's wishlist.
         * @param {object} req - The Express request object.
         * @param {object} res - The Express response object.
         * @param {Function} next - The Express next middleware function.
         * @returns {Promise<void>}
         */
        async getWishlist(req, res, next) {
            try {
                const userId = req.user.id;

                const result = await getWishlistUseCase(userId);

                if (result.isErr) {
                    return res.status(result.error.statusCode || 500).json({
                        success: false,
                        error: result.error.code,
                        message: result.error.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.value,
                });
            } catch (error) {
                next(error);
            }
        },

        /**
         * Handles the request to add a product to the wishlist.
         * @param {object} req - The Express request object.
         * @param {object} res - The Express response object.
         * @param {Function} next - The Express next middleware function.
         * @returns {Promise<void>}
         */
        async addToWishlist(req, res, next) {
            try {
                const { productId } = req.body;
                const userId = req.user.id;

                const result = await addToWishlistUseCase(userId, productId);

                if (result.isErr) {
                    return res.status(result.error.statusCode || 500).json({
                        success: false,
                        error: result.error.code,
                        message: result.error.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.value,
                });
            } catch (error) {
                next(error);
            }
        },

        /**
         * Handles the request to remove a product from the wishlist.
         * @param {object} req - The Express request object.
         * @param {object} res - The Express response object.
         * @param {Function} next - The Express next middleware function.
         * @returns {Promise<void>}
         */
        async removeFromWishlist(req, res, next) {
            try {
                const { productId } = req.params;
                const userId = req.user.id;

                const result = await removeFromWishlistUseCase(userId, productId);

                if (result.isErr) {
                    return res.status(result.error.statusCode || 500).json({
                        success: false,
                        error: result.error.code,
                        message: result.error.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.value,
                });
            } catch (error) {
                next(error);
            }
        },

        /**
         * Handles the request to check if a product is in the wishlist.
         * @param {object} req - The Express request object.
         * @param {object} res - The Express response object.
         * @param {Function} next - The Express next middleware function.
         * @returns {Promise<void>}
         */
        async checkWishlist(req, res, next) {
            try {
                const { productId } = req.params;
                const userId = req.user.id;

                const result = await checkWishlistUseCase(userId, productId);

                if (result.isErr) {
                    return res.status(result.error.statusCode || 500).json({
                        success: false,
                        error: result.error.code,
                        message: result.error.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.value,
                });
            } catch (error) {
                next(error);
            }
        },

        /**
         * Handles the request to clear the wishlist.
         * @param {object} req - The Express request object.
         * @param {object} res - The Express response object.
         * @param {Function} next - The Express next middleware function.
         * @returns {Promise<void>}
         */
        async clearWishlist(req, res, next) {
            try {
                const userId = req.user.id;

                const result = await clearWishlistUseCase(userId);

                if (result.isErr) {
                    return res.status(result.error.statusCode || 500).json({
                        success: false,
                        error: result.error.code,
                        message: result.error.message,
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.value,
                });
            } catch (error) {
                next(error);
            }
        },
    };
}
