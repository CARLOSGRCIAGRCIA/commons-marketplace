import { extractUserRole } from './authorizationMiddleware.js';

export const createCanModifyProduct =
    (getProductByIdUseCase, storeRepository) => async (req, res, next) => {
        try {
            const productId = req.params.id;
            const userId = req.user.id;
            const userRole = extractUserRole(req);

            if (userRole === 'admin') {
                return next();
            }

            const product = await getProductByIdUseCase(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const store = await storeRepository.findById(product.storeId);
            if (!store) {
                return res.status(404).json({ message: 'Associated store not found' });
            }

            if (store.userId !== userId) {
                return res.status(403).json({
                    message:
                        'You do not have permission to modify this product. Only the store owner can modify products.',
                });
            }

            if (store.status !== 'Approved') {
                return res.status(403).json({
                    message: `Cannot modify products for a store with status: ${store.status}. Store must be Approved.`,
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
