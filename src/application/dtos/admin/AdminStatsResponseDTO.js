export const createAdminStatsResponseDTO = (stats) => {
    return {
        totalUsers: stats.totalUsers || 0,
        sellers: stats.sellers || 0,
        buyers: stats.buyers || 0,
        totalProducts: stats.totalProducts || 0,
        activeUsers: stats.activeUsers || 0,
        pendingUsers: stats.pendingUsers || 0,
        timestamp: new Date().toISOString(),
    };
};

export default createAdminStatsResponseDTO;
