/**
 * Middleware to check if the user is the owner of a store or an admin.
 * @param {object} storeRepository - The store repository.
 * @returns {Function} Express middleware function.
 */
export const createCanModifyStore = (storeRepository) => async (req, res, next) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === 'Admin') {
            return next();
        }

        const store = await storeRepository.findById(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        if (store.userId !== userId) {
            return res.status(403).json({
                message: 'You do not have permission to modify this store.',
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
