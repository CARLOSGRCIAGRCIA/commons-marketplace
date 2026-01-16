import { getStoreByUserIdUseCase } from '../../../../src/application/use-cases/store/GetStoreByUserIdUseCase.js';
import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/index.js';

describe('GetStoreByUserIdUseCase Tests', () => {
    let storeRepository;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            findByUserId: jest.fn(),
        };
        useCase = getStoreByUserIdUseCase(storeRepository);
    });

    it('should return store when found by user ID', async () => {
        const userId = 'user123';
        const mockStore = {
            id: 'store123',
            name: 'Test Store',
            userId: userId,
            logo: 'https://example.com/logo.jpg',
        };

        storeRepository.findByUserId.mockResolvedValue(mockStore);

        const result = await useCase(userId);

        expect(storeRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(result).toEqual(createStoreResponseDTO(mockStore));
    });

    it('should return null when store not found for user', async () => {
        const userId = 'user123';

        storeRepository.findByUserId.mockResolvedValue(null);

        const result = await useCase(userId);

        expect(result).toBeNull();
    });

    it('should throw error when userId is not provided', async () => {
        await expect(useCase()).rejects.toThrow('User ID is required.');
        await expect(useCase(null)).rejects.toThrow('User ID is required.');
        await expect(useCase('')).rejects.toThrow('User ID is required.');
    });

    it('should handle repository errors', async () => {
        const userId = 'user123';
        const repositoryError = new Error('Database error');

        storeRepository.findByUserId.mockRejectedValue(repositoryError);

        await expect(useCase(userId)).rejects.toThrow('Database error');
    });
});
