import { createAdminController } from '../../../src/presentation/controllers/adminController.js';
import { createAdminStatsResponseDTO } from '../../../src/application/dtos/admin/AdminStatsResponseDTO.js';
import { log } from '../../../src/infrastructure/logger/logger.js';

jest.mock('../../../src/application/dtos/admin/AdminStatsResponseDTO.js');

describe('AdminController', () => {
    let controller;
    let getAdminStatsUseCase;
    let req;
    let res;

    beforeEach(() => {
        getAdminStatsUseCase = {
            execute: jest.fn(),
        };

        controller = createAdminController(getAdminStatsUseCase);

        req = {};

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        createAdminStatsResponseDTO.mockImplementation((data) => data);

        jest.clearAllMocks();
    });

    describe('getStats', () => {
        it('should return admin statistics successfully', async () => {
            const stats = {
                totalUsers: 100,
                totalProducts: 50,
                totalStores: 25,
                totalOrders: 200,
                revenue: 10000,
            };
            const responseDTO = { ...stats, timestamp: new Date() };

            getAdminStatsUseCase.execute.mockResolvedValue(stats);
            createAdminStatsResponseDTO.mockReturnValue(responseDTO);

            await controller.getStats(req, res);

            expect(getAdminStatsUseCase.execute).toHaveBeenCalled();
            expect(createAdminStatsResponseDTO).toHaveBeenCalledWith(stats);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(responseDTO);
            expect(log.info).toHaveBeenCalledWith('Fetching administrative statistics');
            expect(log.info).toHaveBeenCalledWith(
                'Administrative statistics retrieved successfully',
                {
                    totalUsers: 100,
                    totalProducts: 50,
                    totalStores: 25,
                },
            );
        });

        it('should handle errors and return 500 status', async () => {
            const error = new Error('Database connection failed');
            getAdminStatsUseCase.execute.mockRejectedValue(error);

            await controller.getStats(req, res);

            expect(log.error).toHaveBeenCalledWith('Error getting administrative statistics', {
                error: error.message,
                stack: error.stack,
            });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve administrative statistics',
                message: error.message,
            });
        });

        it('should handle use case execution errors', async () => {
            const error = new Error('Stats calculation failed');
            getAdminStatsUseCase.execute.mockRejectedValue(error);

            await controller.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve administrative statistics',
                message: 'Stats calculation failed',
            });
            expect(log.error).toHaveBeenCalledWith(
                'Error getting administrative statistics',
                expect.any(Object),
            );
        });

        it('should not call DTO transformation when use case fails', async () => {
            const error = new Error('Failed');
            getAdminStatsUseCase.execute.mockRejectedValue(error);

            await controller.getStats(req, res);

            expect(createAdminStatsResponseDTO).not.toHaveBeenCalled();
        });

        it('should return empty stats successfully', async () => {
            const emptyStats = {
                totalUsers: 0,
                totalProducts: 0,
                totalStores: 0,
                totalOrders: 0,
                revenue: 0,
            };

            getAdminStatsUseCase.execute.mockResolvedValue(emptyStats);
            createAdminStatsResponseDTO.mockReturnValue(emptyStats);

            await controller.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(emptyStats);
            expect(log.info).toHaveBeenCalledWith(
                'Administrative statistics retrieved successfully',
                {
                    totalUsers: 0,
                    totalProducts: 0,
                    totalStores: 0,
                },
            );
        });
    });
});
