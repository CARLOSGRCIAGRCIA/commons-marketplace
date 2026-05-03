import { extractUserRole } from './authorizationMiddleware.js';

export const createCanModifyStore = (storeRepository) => async (req, res, next) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;
        const userRole = extractUserRole(req);

        if (userRole === 'admin') {
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
