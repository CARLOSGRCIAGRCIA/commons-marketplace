import { deleteStoreUseCase } from '../../../../src/application/use-cases/store/DeleteStoreByUserIdUseCase.js';
import { createStoreResponseDTO } from '../../../../src/application/dtos/stores/index.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';
import { jest } from '@jest/globals';

describe('DeleteStoreUseCase Tests', () => {
    let storeRepository;
    let productRepository;
    let fileService;
    let useCase;

    beforeEach(() => {
        storeRepository = {
            findById: jest.fn(),
            deleteById: jest.fn(),
        };
        productRepository = {
            findAllByStoreId: jest.fn().mockResolvedValue([]),
            deleteById: jest.fn(),
        };
        fileService = {
            deleteImage: jest.fn(),
            deleteMultipleImages: jest.fn(),
        };
        useCase = deleteStoreUseCase(storeRepository, productRepository, fileService);
        jest.clearAllMocks();
        productRepository.findAllByStoreId.mockResolvedValue([]);
    });

    it('should delete store successfully without logo', async () => {
        const storeId = 'store123';
        const mockStore = {
            _id: storeId,
            storeName: 'Test Store',
            logo: null,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);

        const result = await useCase(storeId);

        expect(result.isOk).toBe(true);
        expect(storeRepository.findById).toHaveBeenCalledWith(storeId);
        expect(storeRepository.deleteById).toHaveBeenCalledWith(storeId);
        expect(fileService.deleteImage).not.toHaveBeenCalled();
        expect(result.value).toEqual(createStoreResponseDTO(mockStore));
        expect(log.info).toHaveBeenCalledWith('Attempting to delete store', { storeId });
        expect(log.info).toHaveBeenCalledWith('Store deleted successfully', expect.any(Object));
    });

    it('should delete store successfully with logo', async () => {
        const storeId = 'store123';
        const mockStore = {
            _id: storeId,
            storeName: 'Test Store',
            logo: 'https://example.com/logo.jpg',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);
        fileService.deleteImage.mockResolvedValue();

        const result = await useCase(storeId);

        expect(result.isOk).toBe(true);
        expect(fileService.deleteImage).toHaveBeenCalledWith('https://example.com/logo.jpg');
        expect(result.value).toEqual(createStoreResponseDTO(mockStore));
        expect(log.debug).toHaveBeenCalledWith('Deleting store logo', expect.any(Object));
        expect(log.debug).toHaveBeenCalledWith('Store logo deleted successfully', { storeId });
    });

    it('should return ok(null) when store not found', async () => {
        const storeId = 'nonexistent';

        storeRepository.findById.mockResolvedValue(null);

        const result = await useCase(storeId);

        expect(result.isOk).toBe(true);
        expect(result.value).toBeNull();
        expect(storeRepository.deleteById).not.toHaveBeenCalled();
        expect(fileService.deleteImage).not.toHaveBeenCalled();
        expect(log.warn).toHaveBeenCalledWith('Store not found for deletion', { storeId });
    });

    it('should handle logo deletion errors gracefully', async () => {
        const storeId = 'store123';
        const mockStore = {
            _id: storeId,
            storeName: 'Test Store',
            logo: 'https://example.com/logo.jpg',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockResolvedValue(mockStore);
        fileService.deleteImage.mockRejectedValue(new Error('Delete failed'));

        const result = await useCase(storeId);

        expect(log.warn).toHaveBeenCalledWith('Could not delete store logo', expect.any(Object));
        expect(result.isOk).toBe(true);
        expect(result.value).toEqual(createStoreResponseDTO(mockStore));
    });

    it('should return error when storeId is not provided', async () => {
        const result = await useCase();
        expect(result.isErr).toBe(true);
        expect(result.error.message).toBe('Store ID is required to delete a store.');
        expect(log.warn).toHaveBeenCalledWith('Attempted to delete store without ID');

        const resultNull = await useCase(null);
        expect(resultNull.isErr).toBe(true);

        const resultEmpty = await useCase('');
        expect(resultEmpty.isErr).toBe(true);
    });

    it('should handle repository deletion errors', async () => {
        const storeId = 'store123';
        const mockStore = {
            _id: storeId,
            storeName: 'Test Store',
            logo: null,
        };
        const deletionError = new Error('Deletion failed');

        storeRepository.findById.mockResolvedValue(mockStore);
        storeRepository.deleteById.mockRejectedValue(deletionError);

        const result = await useCase(storeId);

        expect(result.isErr).toBe(true);
        expect(log.error).toHaveBeenCalledWith('Error in deleteStoreUseCase', expect.any(Object));
    });
});
