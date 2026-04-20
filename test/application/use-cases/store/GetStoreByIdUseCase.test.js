import { getStoreByIdUseCase } from '../../../../src/application/use-cases/store/GetStoreByIdUseCase.js';

jest.mock('../../../../src/infrastructure/logger/logger.js', () => ({
    log: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

describe('GetStoreByIdUseCase', () => {
    let mockStoreRepository;
    let useCase;

    beforeEach(() => {
        mockStoreRepository = {
            findById: jest.fn(),
        };
        useCase = getStoreByIdUseCase(mockStoreRepository);
    });

    it('should return store when found', async () => {
        const mockStore = { _id: 'store123', storeName: 'My Store' };
        mockStoreRepository.findById.mockResolvedValue(mockStore);

        const result = await useCase('store123');

        expect(result).toBeDefined();
        expect(mockStoreRepository.findById).toHaveBeenCalledWith('store123');
    });

    it('should return null when store not found', async () => {
        mockStoreRepository.findById.mockResolvedValue(null);

        const result = await useCase('store123');

        expect(result).toBeNull();
    });

    it('should throw error when storeId is missing', async () => {
        await expect(useCase()).rejects.toThrow('Store ID is required.');
        await expect(useCase(null)).rejects.toThrow('Store ID is required.');
        await expect(useCase('')).rejects.toThrow('Store ID is required.');
    });

    it('should map store to DTO', async () => {
        const mockStore = { _id: 'store123', storeName: 'My Store' };
        mockStoreRepository.findById.mockResolvedValue(mockStore);

        const result = await useCase('store123');

        expect(result).toHaveProperty('id');
    });

    it('should handle repository errors', async () => {
        mockStoreRepository.findById.mockRejectedValue(new Error('DB error'));

        await expect(useCase('store123')).rejects.toThrow('DB error');
    });
});