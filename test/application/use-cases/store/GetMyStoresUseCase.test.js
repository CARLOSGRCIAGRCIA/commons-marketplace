import { getMyStoresUseCase } from '../../../../src/application/use-cases/store/GetMyStoresUseCase.js';
import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/index.js';

describe('GetMyStoresUseCase Tests', () => {
    let storeRepository;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            findAllByUserId: jest.fn(),
        };
        useCase = getMyStoresUseCase(storeRepository);
    });

    it('should return user stores when found', async () => {
        const userId = 'user123';
        const mockStores = [
            {
                id: 'store1',
                name: 'Store 1',
                userId: userId,
                logo: 'https://example.com/logo1.jpg',
            },
            {
                id: 'store2',
                name: 'Store 2',
                userId: userId,
                logo: 'https://example.com/logo2.jpg',
            },
        ];

        storeRepository.findAllByUserId.mockResolvedValue(mockStores);

        const result = await useCase(userId);

        expect(storeRepository.findAllByUserId).toHaveBeenCalledWith(userId);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(createStoreResponseDTO(mockStores[0]));
        expect(result[1]).toEqual(createStoreResponseDTO(mockStores[1]));
    });

    it('should return empty array when user has no stores', async () => {
        const userId = 'user123';

        storeRepository.findAllByUserId.mockResolvedValue([]);

        const result = await useCase(userId);

        expect(result).toEqual([]);
    });

    it('should throw error when userId is not provided', async () => {
        await expect(useCase()).rejects.toThrow('User ID is required.');
        await expect(useCase(null)).rejects.toThrow('User ID is required.');
        await expect(useCase('')).rejects.toThrow('User ID is required.');
    });

    it('should handle repository errors', async () => {
        const userId = 'user123';
        const repositoryError = new Error('Database error');

        storeRepository.findAllByUserId.mockRejectedValue(repositoryError);

        await expect(useCase(userId)).rejects.toThrow('Database error');
    });
});
