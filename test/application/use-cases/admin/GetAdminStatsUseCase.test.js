import { createGetAdminStatsUseCase } from '../../../../src/application/use-cases/admin/GetAdminStatsUseCase.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';

describe('GetAdminStatsUseCase', () => {
    let getAdminStatsUseCase;
    let userRepository;
    let productRepository;

    beforeEach(() => {
        userRepository = {
            findAll: jest.fn(),
        };

        productRepository = {
            findAll: jest.fn(),
        };

        getAdminStatsUseCase = createGetAdminStatsUseCase(userRepository, productRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return admin statistics successfully', async () => {
            const mockUsers = [
                { id: 1, role: 'seller', email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { id: 2, role: 'buyer', emailConfirmedAt: '2023-01-02' },
                { id: 3, role: 'seller', email_confirmed_at: null }, // eslint-disable-line camelcase
                { id: 4, role: 'buyer', emailConfirmedAt: null },
                { id: 5, role: 'admin', email_confirmed_at: '2023-01-03' }, // eslint-disable-line camelcase
            ];

            const mockProducts = [
                { id: 1, name: 'Product 1', price: 100 },
                { id: 2, name: 'Product 2', price: 200 },
                { id: 3, name: 'Product 3', price: 300 },
            ];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
            expect(productRepository.findAll).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                totalUsers: 5,
                sellers: 2,
                buyers: 2,
                activeUsers: 3,
                pendingUsers: 2,
                totalProducts: 3,
            });

            expect(log.info).toHaveBeenCalledWith('Fetching admin statistics');
            expect(log.debug).toHaveBeenCalledWith('Data retrieved', {
                userCount: 5,
                productCount: 3,
            });
            expect(log.info).toHaveBeenCalledWith('Admin statistics calculated successfully', {
                totalUsers: 5,
                totalProducts: 3,
            });
        });

        it('should handle empty users and products', async () => {
            userRepository.findAll.mockResolvedValue([]);
            productRepository.findAll.mockResolvedValue([]);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 0,
                sellers: 0,
                buyers: 0,
                activeUsers: 0,
                pendingUsers: 0,
                totalProducts: 0,
            });

            expect(log.info).toHaveBeenCalledWith('Fetching admin statistics');
        });

        it('should handle users with no role', async () => {
            const mockUsers = [
                { id: 1, email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { id: 2, role: null, emailConfirmedAt: '2023-01-02' },
                { id: 3, role: '', email_confirmed_at: null }, // eslint-disable-line camelcase
            ];

            const mockProducts = [{ id: 1, name: 'Product 1' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 3,
                sellers: 0,
                buyers: 0,
                activeUsers: 2,
                pendingUsers: 1,
                totalProducts: 1,
            });
        });

        it('should handle case insensitive roles', async () => {
            const mockUsers = [
                { id: 1, role: 'SELLER', email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { id: 2, role: 'Seller', emailConfirmedAt: '2023-01-02' },
                { id: 3, role: 'BUYER', email_confirmed_at: '2023-01-03' }, // eslint-disable-line camelcase
                { id: 4, role: 'Buyer', emailConfirmedAt: '2023-01-04' },
            ];

            const mockProducts = [{ id: 1, name: 'Product 1' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 4,
                sellers: 2,
                buyers: 2,
                activeUsers: 4,
                pendingUsers: 0,
                totalProducts: 1,
            });
        });

        it('should handle users with only email_confirmed_at field', async () => {
            const mockUsers = [
                { id: 1, role: 'seller', email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { id: 2, role: 'buyer', email_confirmed_at: null }, // eslint-disable-line camelcase
                { id: 3, role: 'seller', email_confirmed_at: '2023-01-03' }, // eslint-disable-line camelcase
            ];

            const mockProducts = [{ id: 1, name: 'Product 1' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 3,
                sellers: 2,
                buyers: 1,
                activeUsers: 2,
                pendingUsers: 1,
                totalProducts: 1,
            });
        });

        it('should handle users with only emailConfirmedAt field', async () => {
            const mockUsers = [
                { id: 1, role: 'seller', emailConfirmedAt: '2023-01-01' },
                { id: 2, role: 'buyer', emailConfirmedAt: null },
                { id: 3, role: 'seller', emailConfirmedAt: '2023-01-03' },
            ];

            const mockProducts = [{ id: 1, name: 'Product 1' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 3,
                sellers: 2,
                buyers: 1,
                activeUsers: 2,
                pendingUsers: 1,
                totalProducts: 1,
            });
        });

        it('should handle mixed email confirmation fields', async () => {
            const mockUsers = [
                { id: 1, role: 'seller', email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { id: 2, role: 'buyer', emailConfirmedAt: '2023-01-02' },
                { id: 3, role: 'seller', email_confirmed_at: null }, // eslint-disable-line camelcase
                { id: 4, role: 'buyer', emailConfirmedAt: null },
            ];

            const mockProducts = [{ id: 1, name: 'Product 1' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result).toEqual({
                totalUsers: 4,
                sellers: 2,
                buyers: 2,
                activeUsers: 2,
                pendingUsers: 2,
                totalProducts: 1,
            });
        });

        it('should handle repository errors and rethrow them', async () => {
            const repositoryError = new Error('Database connection failed');
            userRepository.findAll.mockRejectedValue(repositoryError);

            await expect(getAdminStatsUseCase.execute()).rejects.toThrow(
                'Database connection failed',
            );

            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
            expect(log.error).toHaveBeenCalledWith('Error in GetAdminStatsUseCase', {
                error: 'Database connection failed',
                stack: expect.any(String),
            });
        });

        it('should handle product repository errors', async () => {
            const mockUsers = [{ id: 1, role: 'seller', email_confirmed_at: '2023-01-01' }]; // eslint-disable-line camelcase
            const repositoryError = new Error('Product database error');

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockRejectedValue(repositoryError);

            await expect(getAdminStatsUseCase.execute()).rejects.toThrow('Product database error');

            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
            expect(productRepository.findAll).toHaveBeenCalledTimes(1);
            expect(log.error).toHaveBeenCalledWith('Error in GetAdminStatsUseCase', {
                error: 'Product database error',
                stack: expect.any(String),
            });
        });
    });

    describe('calculateUserStats integration', () => {
        it('should calculate stats for users with various roles and statuses', async () => {
            const mockUsers = [
                { role: 'seller', email_confirmed_at: '2023-01-01' }, // eslint-disable-line camelcase
                { role: 'buyer', emailConfirmedAt: '2023-01-02' },
                { role: 'seller', email_confirmed_at: null }, // eslint-disable-line camelcase
                { role: 'buyer', emailConfirmedAt: null },
                { role: 'admin', email_confirmed_at: '2023-01-03' }, // eslint-disable-line camelcase
                { role: 'moderator', emailConfirmedAt: '2023-01-04' },
            ];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue([]);

            const result = await getAdminStatsUseCase.execute();

            expect(result.sellers).toBe(2);
            expect(result.buyers).toBe(2);
            expect(result.activeUsers).toBe(4);
            expect(result.pendingUsers).toBe(2);
        });

        it('should handle users without email confirmation fields', async () => {
            const mockUsers = [{ role: 'seller' }, { role: 'buyer' }];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue([]);

            const result = await getAdminStatsUseCase.execute();

            expect(result.activeUsers).toBe(0);
            expect(result.pendingUsers).toBe(2);
        });
    });

    describe('calculateProductStats integration', () => {
        it('should calculate product count correctly', async () => {
            const mockUsers = [{ role: 'seller', email_confirmed_at: '2023-01-01' }]; // eslint-disable-line camelcase
            const mockProducts = [
                { id: 1, name: 'Product 1' },
                { id: 2, name: 'Product 2' },
                { id: 3, name: 'Product 3' },
                { id: 4, name: 'Product 4' },
            ];

            userRepository.findAll.mockResolvedValue(mockUsers);
            productRepository.findAll.mockResolvedValue(mockProducts);

            const result = await getAdminStatsUseCase.execute();

            expect(result.totalProducts).toBe(4);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large datasets', async () => {
            const largeUsersArray = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                role: i % 3 === 0 ? 'seller' : 'buyer',
                email_confirmed_at: i % 2 === 0 ? '2023-01-01' : null, // eslint-disable-line camelcase
            }));

            const largeProductsArray = Array.from({ length: 500 }, (_, i) => ({
                id: i + 1,
                name: `Product ${i + 1}`,
            }));

            userRepository.findAll.mockResolvedValue(largeUsersArray);
            productRepository.findAll.mockResolvedValue(largeProductsArray);

            const result = await getAdminStatsUseCase.execute();

            expect(result.totalUsers).toBe(1000);
            expect(result.totalProducts).toBe(500);
            expect(result.activeUsers).toBe(500);
            expect(result.pendingUsers).toBe(500);
        });

        it('should handle undefined users array gracefully', async () => {
            userRepository.findAll.mockResolvedValue(undefined);
            productRepository.findAll.mockResolvedValue([]);

            await expect(getAdminStatsUseCase.execute()).rejects.toThrow();
            expect(log.error).toHaveBeenCalled();
        });

        it('should handle null users array gracefully', async () => {
            userRepository.findAll.mockResolvedValue(null);
            productRepository.findAll.mockResolvedValue([{ id: 1, name: 'Product 1' }]);

            await expect(getAdminStatsUseCase.execute()).rejects.toThrow();
            expect(log.error).toHaveBeenCalled();
        });
    });
});
