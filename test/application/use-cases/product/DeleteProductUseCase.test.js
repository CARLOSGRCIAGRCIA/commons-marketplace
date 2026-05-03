import { deleteProductUseCase } from '../../../../src/application/use-cases/product/DeleteProductUseCase.js';
import { createProductResponseDTO } from '../../../../src/application/dtos/products/ProductResponseDTO.js';
import { deleteImage, deleteMultipleImages } from '../../../../src/core/services/fileService.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';
import { jest } from '@jest/globals';

jest.mock('../../../../src/core/services/fileService.js');

describe('DeleteProductUseCase Tests', () => {
    let productRepository;
    let storeRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            findById: jest.fn(),
            deleteById: jest.fn(),
        };
        storeRepository = {
            decrementProductCount: jest.fn(),
        };
        useCase = deleteProductUseCase(productRepository, storeRepository);

        jest.clearAllMocks();
    });

    it('should delete a product with images and return it', async () => {
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            storeId: 'store1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.deleteById.mockResolvedValue(mockProduct);
        deleteImage.mockResolvedValue(true);
        deleteMultipleImages.mockResolvedValue(true);

        const result = await useCase('1');

        expect(productRepository.findById).toHaveBeenCalledWith('1');
        expect(deleteImage).toHaveBeenCalledWith('https://example.com/main.jpg');
        expect(deleteMultipleImages).toHaveBeenCalledWith([
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
        ]);
        expect(productRepository.deleteById).toHaveBeenCalledWith('1');
        expect(storeRepository.decrementProductCount).toHaveBeenCalledWith('store1');
        expect(result.isOk).toBe(true);
        expect(result.value).toEqual(createProductResponseDTO(mockProduct));
        expect(log.info).toHaveBeenCalledWith('Attempting to delete product', { productId: '1' });
        expect(log.debug).toHaveBeenCalledWith(
            'Product found, proceeding with image deletion',
            expect.any(Object),
        );
        expect(log.info).toHaveBeenCalledWith('Product deleted successfully', expect.any(Object));
    });

    it('should delete a product without additional images', async () => {
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            storeId: 'store1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.deleteById.mockResolvedValue(mockProduct);
        deleteImage.mockResolvedValue(true);

        const result = await useCase('1');

        expect(deleteImage).toHaveBeenCalledWith('https://example.com/main.jpg');
        expect(deleteMultipleImages).not.toHaveBeenCalled();
        expect(result.isOk).toBe(true);
        expect(result.value).toEqual(createProductResponseDTO(mockProduct));
    });

    it('should return null if the product is not found', async () => {
        productRepository.findById.mockResolvedValue(null);

        const result = await useCase('1');

        expect(productRepository.findById).toHaveBeenCalledWith('1');
        expect(deleteImage).not.toHaveBeenCalled();
        expect(deleteMultipleImages).not.toHaveBeenCalled();
        expect(productRepository.deleteById).not.toHaveBeenCalled();
        expect(result.isOk).toBe(true);
        expect(result.value).toBeNull();
        expect(log.warn).toHaveBeenCalledWith('Product not found for deletion', { productId: '1' });
    });

    it('should continue deletion even if main image deletion fails', async () => {
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            storeId: 'store1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.deleteById.mockResolvedValue(mockProduct);
        deleteImage.mockRejectedValue(new Error('Image deletion failed'));

        const result = await useCase('1');

        expect(deleteImage).toHaveBeenCalledWith('https://example.com/main.jpg');
        expect(productRepository.deleteById).toHaveBeenCalledWith('1');
        expect(result.isOk).toBe(true);
        expect(result.value).toEqual(createProductResponseDTO(mockProduct));
        expect(log.warn).toHaveBeenCalledWith('Failed to delete main image', expect.any(Object));
    });

    it('should continue deletion even if additional images deletion fails', async () => {
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            storeId: 'store1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/img1.jpg'],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.deleteById.mockResolvedValue(mockProduct);
        deleteImage.mockResolvedValue(true);
        deleteMultipleImages.mockRejectedValue(new Error('Multiple images deletion failed'));

        const result = await useCase('1');

        expect(deleteMultipleImages).toHaveBeenCalledWith(['https://example.com/img1.jpg']);
        expect(productRepository.deleteById).toHaveBeenCalledWith('1');
        expect(result.isOk).toBe(true);
        expect(result.value).toEqual(createProductResponseDTO(mockProduct));
        expect(log.warn).toHaveBeenCalledWith(
            'Failed to delete additional images',
            expect.any(Object),
        );
    });

    it('should return an error on repository failure', async () => {
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            storeId: 'store1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };
        const error = new Error('DB error');

        productRepository.findById.mockResolvedValue(mockProduct);
        deleteImage.mockResolvedValue(true);
        productRepository.deleteById.mockRejectedValue(error);

        const result = await useCase('1');

        expect(result.isErr).toBe(true);
        expect(result.error.message).toBe('Failed to delete product: DB error');
        expect(result.error.statusCode).toBe(500);
        expect(log.error).toHaveBeenCalledWith('Error in deleteProductUseCase', expect.any(Object));
    });
});
