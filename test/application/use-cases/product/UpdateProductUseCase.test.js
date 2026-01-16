import { updateProductUseCase } from '../../../../src/application/use-cases/product/UpdateProductUseCase.js';
import { createUpdateProductDTO } from '../../../../src/application/dtos/products/UpdateProductDTO.js';
import { createProductResponseDTO } from '../../../../src/application/dtos/products/ProductResponseDTO.js';
import {
    uploadMultipleImages,
    deleteMultipleImages,
    replaceImage,
} from '../../../../src/core/services/fileService.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';
import { jest } from '@jest/globals';

jest.mock('../../../../src/core/services/fileService.js');

describe('UpdateProductUseCase Tests', () => {
    let productRepository;
    let categoryRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            findById: jest.fn(),
            updateById: jest.fn(),
        };
        categoryRepository = {
            findById: jest.fn(),
        };
        useCase = updateProductUseCase(productRepository, categoryRepository);

        jest.clearAllMocks();
    });

    it('should update a product without changing images', async () => {
        const updateData = { name: 'Updated Product', price: 150 };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/img1.jpg'],
        };
        const updatedProduct = { ...mockProduct, ...updateData };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData);

        expect(productRepository.findById).toHaveBeenCalledWith('1');
        expect(productRepository.updateById).toHaveBeenCalledWith(
            '1',
            createUpdateProductDTO(updateData),
        );
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
        expect(log.info).toHaveBeenCalledWith('Attempting to update product', expect.any(Object));
        expect(log.info).toHaveBeenCalledWith('Product updated successfully', expect.any(Object));
    });

    it('should update main image when provided', async () => {
        const updateData = { name: 'Updated Product' };
        const newMainImageFile = { filename: 'new-main.jpg' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };

        const newMainImageUrl = 'https://example.com/new-main.jpg';
        const updatedProduct = { ...mockProduct, ...updateData, mainImageUrl: newMainImageUrl };

        productRepository.findById.mockResolvedValue(mockProduct);
        replaceImage.mockResolvedValue(newMainImageUrl);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData, newMainImageFile);

        expect(replaceImage).toHaveBeenCalledWith(
            'https://example.com/main.jpg',
            newMainImageFile,
            { folder: 'products', prefix: 'main' },
        );
        expect(productRepository.updateById).toHaveBeenCalledWith(
            '1',
            createUpdateProductDTO({ ...updateData, mainImageUrl: newMainImageUrl }),
        );
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
        expect(log.debug).toHaveBeenCalledWith('Replacing main image', { productId: '1' });
        expect(log.debug).toHaveBeenCalledWith(
            'Main image replaced successfully',
            expect.any(Object),
        );
    });

    it('should replace additional images when action is "replace"', async () => {
        const updateData = { name: 'Updated Product' };
        const newAdditionalImagesFiles = [{ filename: 'new1.jpg' }, { filename: 'new2.jpg' }];
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/old1.jpg', 'https://example.com/old2.jpg'],
        };

        const newImageUrls = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg'];
        const updatedProduct = { ...mockProduct, ...updateData, imageUrls: newImageUrls };

        productRepository.findById.mockResolvedValue(mockProduct);
        deleteMultipleImages.mockResolvedValue(true);
        uploadMultipleImages.mockResolvedValue(newImageUrls);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData, null, newAdditionalImagesFiles, 'replace');

        expect(deleteMultipleImages).toHaveBeenCalledWith([
            'https://example.com/old1.jpg',
            'https://example.com/old2.jpg',
        ]);
        expect(uploadMultipleImages).toHaveBeenCalledWith(newAdditionalImagesFiles, {
            folder: 'products',
            prefix: 'gallery',
        });
        expect(productRepository.updateById).toHaveBeenCalledWith(
            '1',
            createUpdateProductDTO({ ...updateData, imageUrls: newImageUrls }),
        );
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
        expect(log.debug).toHaveBeenCalledWith(
            'Replacing all additional images',
            expect.any(Object),
        );
        expect(log.debug).toHaveBeenCalledWith('Additional images replaced', expect.any(Object));
    });

    it('should replace with empty array when action is "replace" and no new images provided', async () => {
        const updateData = { name: 'Updated Product' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/old1.jpg'],
        };

        const updatedProduct = { ...mockProduct, ...updateData, imageUrls: [] };

        productRepository.findById.mockResolvedValue(mockProduct);
        deleteMultipleImages.mockResolvedValue(true);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData, null, [], 'replace');

        expect(deleteMultipleImages).toHaveBeenCalledWith(['https://example.com/old1.jpg']);
        expect(uploadMultipleImages).not.toHaveBeenCalled();
        expect(productRepository.updateById).toHaveBeenCalledWith(
            '1',
            createUpdateProductDTO({ ...updateData, imageUrls: [] }),
        );
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
        expect(log.debug).toHaveBeenCalledWith('All additional images removed', { productId: '1' });
    });

    it('should add additional images when action is "add"', async () => {
        const updateData = { name: 'Updated Product' };
        const newAdditionalImagesFiles = [{ filename: 'new1.jpg' }];
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/img1.jpg'],
        };

        const newImageUrls = ['https://example.com/new1.jpg'];
        const combinedImageUrls = [...mockProduct.imageUrls, ...newImageUrls];
        const updatedProduct = { ...mockProduct, ...updateData, imageUrls: combinedImageUrls };

        productRepository.findById.mockResolvedValue(mockProduct);
        uploadMultipleImages.mockResolvedValue(newImageUrls);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData, null, newAdditionalImagesFiles, 'add');

        expect(uploadMultipleImages).toHaveBeenCalledWith(newAdditionalImagesFiles, {
            folder: 'products',
            prefix: 'gallery',
        });
        expect(productRepository.updateById).toHaveBeenCalledWith(
            '1',
            createUpdateProductDTO({ ...updateData, imageUrls: combinedImageUrls }),
        );
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
        expect(log.debug).toHaveBeenCalledWith('Adding additional images', expect.any(Object));
        expect(log.debug).toHaveBeenCalledWith('Additional images added', expect.any(Object));
    });

    it('should respect 5 image limit when adding images', async () => {
        const updateData = { name: 'Updated Product' };
        const newAdditionalImagesFiles = [
            { filename: 'new1.jpg' },
            { filename: 'new2.jpg' },
            { filename: 'new3.jpg' },
        ];
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [
                'https://example.com/img1.jpg',
                'https://example.com/img2.jpg',
                'https://example.com/img3.jpg',
            ],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        uploadMultipleImages.mockResolvedValue([]);
        productRepository.updateById.mockResolvedValue(mockProduct);

        await useCase('1', updateData, null, newAdditionalImagesFiles, 'add');

        expect(uploadMultipleImages).toHaveBeenCalledWith(newAdditionalImagesFiles.slice(0, 2), {
            folder: 'products',
            prefix: 'gallery',
        });
    });

    it('should keep existing images when action is "keep"', async () => {
        const updateData = { name: 'Updated Product' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: ['https://example.com/img1.jpg'],
        };
        const updatedProduct = { ...mockProduct, ...updateData };

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        const result = await useCase('1', updateData, null, [], 'keep');

        expect(deleteMultipleImages).not.toHaveBeenCalled();
        expect(uploadMultipleImages).not.toHaveBeenCalled();
        expect(result).toEqual(createProductResponseDTO(updatedProduct));
    });

    it('should throw error if product is not found', async () => {
        const updateData = { name: 'Updated Product' };
        productRepository.findById.mockResolvedValue(null);

        await expect(useCase('1', updateData)).rejects.toThrow(
            'Failed to update product: Product not found',
        );

        expect(log.warn).toHaveBeenCalledWith('Product not found for update', { productId: '1' });
        expect(log.error).toHaveBeenCalledWith('Error in updateProductUseCase', expect.any(Object));
    });

    it('should handle image upload errors', async () => {
        const updateData = { name: 'Updated Product' };
        const newMainImageFile = { filename: 'new-main.jpg' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        replaceImage.mockRejectedValue(new Error('Upload failed'));

        await expect(useCase('1', updateData, newMainImageFile)).rejects.toThrow(
            'Failed to update product: Upload failed',
        );

        expect(log.error).toHaveBeenCalledWith('Error in updateProductUseCase', expect.any(Object));
    });

    it('should handle repository errors', async () => {
        const updateData = { name: 'Updated Product' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };
        const error = new Error('DB error');

        productRepository.findById.mockResolvedValue(mockProduct);
        productRepository.updateById.mockRejectedValue(error);

        await expect(useCase('1', updateData)).rejects.toThrow(
            'Failed to update product: DB error',
        );

        expect(log.error).toHaveBeenCalledWith('Error in updateProductUseCase', expect.any(Object));
    });

    it('should validate category when provided', async () => {
        const updateData = { name: 'Updated Product', categoryId: 'cat123' };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };
        const mockCategory = { id: 'cat123', name: 'Electronics', isActive: true };
        const updatedProduct = { ...mockProduct, ...updateData, categoryName: 'Electronics' };

        productRepository.findById.mockResolvedValue(mockProduct);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        await useCase('1', updateData);

        expect(log.debug).toHaveBeenCalledWith('Validating category', { categoryId: 'cat123' });
        expect(categoryRepository.findById).toHaveBeenCalledWith('cat123');
    });

    it('should validate subcategory when provided', async () => {
        const updateData = {
            name: 'Updated Product',
            categoryId: 'cat123',
            subCategoryId: 'sub456',
        };
        const mockProduct = {
            id: '1',
            name: 'Test Product',
            categoryId: 'cat123',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
        };
        const mockCategory = { id: 'cat123', name: 'Electronics', isActive: true };
        const mockSubCategory = {
            id: 'sub456',
            name: 'Laptops',
            isActive: true,
            parent: 'cat123',
        };
        const updatedProduct = {
            ...mockProduct,
            ...updateData,
            categoryName: 'Electronics',
            subCategoryName: 'Laptops',
        };

        productRepository.findById.mockResolvedValue(mockProduct);
        categoryRepository.findById
            .mockResolvedValueOnce(mockCategory)
            .mockResolvedValueOnce(mockSubCategory);
        productRepository.updateById.mockResolvedValue(updatedProduct);

        await useCase('1', updateData);

        expect(log.debug).toHaveBeenCalledWith('Validating subcategory', {
            subCategoryId: 'sub456',
        });
        expect(categoryRepository.findById).toHaveBeenCalledWith('sub456');
    });
});
