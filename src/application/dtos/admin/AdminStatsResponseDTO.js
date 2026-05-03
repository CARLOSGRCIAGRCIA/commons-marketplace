export const createAdminStatsResponseDTO = (stats) => {
    return {
        totalUsers: stats.totalUsers || 0,
        sellers: stats.sellers || 0,
        buyers: stats.buyers || 0,
        totalProducts: stats.totalProducts || 0,
        totalStores: stats.totalStores || 0,
        totalReviews: stats.totalReviews || 0,
        pendingStores: stats.pendingStores || 0,
        pendingSellerRequests: stats.pendingSellerRequests || 0,
        activeUsers: stats.activeUsers || 0,
        pendingUsers: stats.pendingUsers || 0,
        timestamp: new Date().toISOString(),
    };
};

export default createAdminStatsResponseDTO;
