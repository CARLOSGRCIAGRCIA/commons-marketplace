import { createAdminStatsResponseDTO } from '../../application/dtos/admin/AdminStatsResponseDTO.js';
import { log } from '../../infrastructure/logger/logger.js';

export const createAdminController = (getAdminStatsUseCase) => {
    const getStats = async (req, res) => {
        try {
            log.info('Fetching administrative statistics');

            const stats = await getAdminStatsUseCase.execute();
            const responseDTO = createAdminStatsResponseDTO(stats);

            log.info('Administrative statistics retrieved successfully', {
                totalUsers: stats.totalUsers,
                totalProducts: stats.totalProducts,
                totalStores: stats.totalStores,
            });

            return res.status(200).json(responseDTO);
        } catch (error) {
            log.error('Error getting administrative statistics', {
                error: error.message,
                stack: error.stack,
            });
            return res.status(500).json({
                error: 'Failed to retrieve administrative statistics',
                message: error.message,
            });
        }
    };

    return {
        getStats,
    };
};

export default createAdminController;
