import { getAllStoresUseCase } from '../../../../src/application/use-cases/store/GetAllStoresUseCase.js';

jest.mock('../../../../src/infrastructure/logger/logger.js', () => ({
    log: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

describe('GetAllStoresUseCase', () => {
    let mockStoreRepository;
    let useCase;

    beforeEach(() => {
        mockStoreRepository = {
            findAll: jest.fn(),
            findByCategoryId: jest.fn(),
        };
        useCase = getAllStoresUseCase(mockStoreRepository);
    });

    it('should return all approved stores', async () => {
        const mockStores = [
            { _id: 'store1', storeName: 'Store 1' },
            { _id: 'store2', storeName: 'Store 2' },
        ];
        mockStoreRepository.findAll.mockResolvedValue(mockStores);

        const result = await useCase();

        expect(result).toHaveLength(2);
        expect(mockStoreRepository.findAll).toHaveBeenCalled();
    });

    it('should filter by categoryId', async () => {
        const mockStores = [{ _id: 'store1', storeName: 'Store 1' }];
        mockStoreRepository.findByCategoryId.mockResolvedValue(mockStores);

        const result = await useCase({ categoryId: 'cat123' });

        expect(result).toHaveLength(1);
        expect(mockStoreRepository.findByCategoryId).toHaveBeenCalledWith('cat123');
        expect(mockStoreRepository.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no stores exist', async () => {
        mockStoreRepository.findAll.mockResolvedValue([]);

        const result = await useCase();

        expect(result).toEqual([]);
    });

    it('should map stores to DTOs with correct properties', async () => {
        const mockStores = [{ _id: 'store1', storeName: 'Store 1' }];
        mockStoreRepository.findAll.mockResolvedValue(mockStores);

        const result = await useCase();

        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('storeName');
    });

    it('should handle repository errors', async () => {
        mockStoreRepository.findAll.mockRejectedValue(new Error('DB error'));

        await expect(useCase()).rejects.toThrow('DB error');
    });
});