import { deleteStoreUseCase } from '../../../../src/application/use-cases/store/DeleteStoreByUserIdUseCase.js';
import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/index.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';

describe('DeleteStoreUseCase Tests', () => {
    let storeRepository;
    let fileService;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            findById: jest.fn(),
            deleteById: jest.fn(),
        };
        fileService = {
            deleteImage: jest.fn(),
        };
        useCase = deleteStoreUseCase(storeRepository, fileService);
        jest.clearAllMocks();
    });

    it('should delete store successfully without logo', async () => {
        const storeId = 'store123';
        const mockStore = {
            id: storeId,
            name: 'Test Store',
            logo: null,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);

        const result = await useCase(storeId);

        expect(storeRepository.findById).toHaveBeenCalledWith(storeId);
        expect(storeRepository.deleteById).toHaveBeenCalledWith(storeId);
        expect(fileService.deleteImage).not.toHaveBeenCalled();
        expect(result).toEqual(createStoreResponseDTO(mockStore));
        expect(log.info).toHaveBeenCalledWith('Attempting to delete store', { storeId });
        expect(log.info).toHaveBeenCalledWith('Store deleted successfully', expect.any(Object));
    });

    it('should delete store successfully with logo', async () => {
        const storeId = 'store123';
        const mockStore = {
            id: storeId,
            name: 'Test Store',
            logo: 'https://example.com/logo.jpg',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);
        fileService.deleteImage.mockResolvedValue();

        const result = await useCase(storeId);

        expect(fileService.deleteImage).toHaveBeenCalledWith('https://example.com/logo.jpg');
        expect(result).toEqual(createStoreResponseDTO(mockStore));
        expect(log.debug).toHaveBeenCalledWith('Deleting store logo', expect.any(Object));
        expect(log.debug).toHaveBeenCalledWith('Store logo deleted successfully', { storeId });
    });

    it('should return null when store not found', async () => {
        const storeId = 'nonexistent';

        storeRepository.findById.mockResolvedValue(null);

        const result = await useCase(storeId);

        expect(result).toBeNull();
        expect(storeRepository.deleteById).not.toHaveBeenCalled();
        expect(fileService.deleteImage).not.toHaveBeenCalled();
        expect(log.warn).toHaveBeenCalledWith('Store not found for deletion', { storeId });
    });

    it('should handle logo deletion errors gracefully', async () => {
        const storeId = 'store123';
        const mockStore = {
            id: storeId,
            name: 'Test Store',
            logo: 'https://example.com/logo.jpg',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);
        fileService.deleteImage.mockRejectedValue(new Error('Delete failed'));

        const result = await useCase(storeId);

        expect(log.warn).toHaveBeenCalledWith('Could not delete store logo', expect.any(Object));
        expect(result).toEqual(createStoreResponseDTO(mockStore));
    });

    it('should throw error when storeId is not provided', async () => {
        await expect(useCase()).rejects.toThrow('Store ID is required to delete a store.');
        expect(log.warn).toHaveBeenCalledWith('Attempted to delete store without ID');

        await expect(useCase(null)).rejects.toThrow('Store ID is required to delete a store.');
        await expect(useCase('')).rejects.toThrow('Store ID is required to delete a store.');
    });

    it('should handle repository deletion errors', async () => {
        const storeId = 'store123';
        const mockStore = {
            id: storeId,
            name: 'Test Store',
            logo: null,
        };
        const deletionError = new Error('Deletion failed');

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockRejectedValue(deletionError);

        await expect(useCase(storeId)).rejects.toThrow('Deletion failed');
        expect(log.error).toHaveBeenCalledWith('Error in deleteStoreUseCase', expect.any(Object));
    });
});
