import { log } from '../../../infrastructure/logger/logger.js';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';
import ProductModel from '../../../infrastructure/database/mongo/models/ProductModel.js';
import StoreModel from '../../../infrastructure/database/mongo/models/StoreModel.js';
import UserModel from '../../../infrastructure/database/mongo/models/UserModel.js';

export const createGetAdminStatsUseCase = (userRepository, productRepository, categoryRepository, storeRepository) => {
    const execute = async () => {
        try {
            const cached = cacheManager.get(CACHE_KEYS.ADMIN_STATS);
            if (cached !== null) {
                log.debug('Admin stats served from cache');
                return cached;
            }

            log.info('Fetching admin statistics');

            // Use Mongoose models directly to bypass repository filters
            const [users, products, stores] = await Promise.all([
                UserModel.find({}).lean(),
                ProductModel.find({}).lean(),
                StoreModel.find({}).lean(),
            ]);

            const userStats = calculateUserStats(users);
            const productStats = calculateProductStats(products);
            const storeStats = calculateStoreStats(stores);

            const result = {
                totalUsers: userStats.totalUsers,
                totalProducts: productStats.totalProducts,
                totalStores: storeStats.totalStores,
                totalReviews: 0,
                pendingStores: storeStats.pendingStores,
                pendingSellerRequests: 0,
            };

            cacheManager.set(CACHE_KEYS.ADMIN_STATS, result, CACHE_TTL.ADMIN_STATS);

            log.info('Admin statistics calculated successfully', {
                totalUsers: userStats.totalUsers,
                totalProducts: productStats.totalProducts,
            });

            return result;
        } catch (error) {
            log.error('Error in GetAdminStatsUseCase', {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    return { execute };
};

const calculateUserStats = (users) => {
    const stats = {
        totalUsers: users.length,
        sellers: 0,
        buyers: 0,
        activeUsers: 0,
        pendingUsers: 0,
    };

    users.forEach((user) => {
        const role = user.role?.toLowerCase() || '';
        if (role === 'seller') {
            stats.sellers++;
        } else if (role === 'buyer') {
            stats.buyers++;
        }

        if (user.email_confirmed_at || user.emailConfirmedAt) {
            stats.activeUsers++;
        } else {
            stats.pendingUsers++;
        }
    });

    return stats;
};

const calculateProductStats = (products) => {
    return {
        totalProducts: products.length,
    };
};

const calculateStoreStats = (stores) => {
    const stats = {
        totalStores: stores.length,
        pendingStores: 0,
    };
    stores.forEach((store) => {
        const status = store.status?.toLowerCase() || '';
        if (status === 'pending' || status === 'pendiente') {
            stats.pendingStores++;
        }
    });
    return stats;
};

export default createGetAdminStatsUseCase;
