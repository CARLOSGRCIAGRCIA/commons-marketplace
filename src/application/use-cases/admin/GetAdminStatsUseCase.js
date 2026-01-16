import { log } from '../../../infrastructure/logger/logger.js';

export const createGetAdminStatsUseCase = (userRepository, productRepository) => {
    const execute = async () => {
        try {
            log.info('Fetching admin statistics');

            const [users, products] = await Promise.all([
                userRepository.findAll(),
                productRepository.findAll(),
            ]);

            log.debug('Data retrieved', {
                userCount: users.length,
                productCount: products.length,
            });

            const userStats = calculateUserStats(users);
            const productStats = calculateProductStats(products);

            log.info('Admin statistics calculated successfully', {
                totalUsers: userStats.totalUsers,
                totalProducts: productStats.totalProducts,
            });

            return {
                ...userStats,
                ...productStats,
            };
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

export default createGetAdminStatsUseCase;
