import { createProductUseCase } from '../../../../src/application/use-cases/product/CreateProductUseCase.js';
import { createCreateProductDTO } from '../../../../src/application/dtos/products/CreateProductDTO.js';
import { createProductResponseDTO } from '../../../../src/application/dtos/products/ProductResponseDTO.js';
import { uploadImage, uploadMultipleImages } from '../../../../src/core/services/fileService.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';
import { jest } from '@jest/globals';

jest.mock('../../../../src/core/services/fileService.js');

describe('CreateProductUseCase Tests', () => {
    let productRepository;
    let storeRepository;
    let categoryRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            create: jest.fn(),
        };
        storeRepository = {
            findById: jest.fn(),
        };
        categoryRepository = {
            findById: jest.fn(),
        };
        useCase = createProductUseCase(productRepository, storeRepository, categoryRepository);

        jest.clearAllMocks();
    });

    it('should create a product with main image and return it', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const mockProduct = {
            ...productData,
            id: '1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
            categoryName: 'Electronics',
            subCategoryName: null,
        };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        uploadImage.mockResolvedValue('https://example.com/main.jpg');
        productRepository.create.mockResolvedValue(mockProduct);

        const result = await useCase(productData, mainImageFile);

        expect(storeRepository.findById).toHaveBeenCalledWith('store1');
        expect(categoryRepository.findById).toHaveBeenCalledWith('cat1');
        expect(uploadImage).toHaveBeenCalledWith(mainImageFile, {
            folder: 'products',
            prefix: 'main',
        });
        expect(productRepository.create).toHaveBeenCalledWith(
            createCreateProductDTO({
                ...productData,
                mainImageUrl: 'https://example.com/main.jpg',
                imageUrls: [],
                categoryName: 'Electronics',
                subCategoryName: null,
            }),
        );
        expect(result).toEqual(createProductResponseDTO(mockProduct));

        expect(log.info).toHaveBeenCalledWith('Creating new product', {
            productName: 'Test Product',
            sellerId: 'seller1',
            storeId: 'store1',
        });
        expect(log.info).toHaveBeenCalledWith('Product created successfully', {
            productId: '1',
            productName: 'Test Product',
        });
    });

    it('should create a product with main image and additional images', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const additionalImagesFiles = [{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }];

        const additionalImageUrls = [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
        ];

        const mockProduct = {
            ...productData,
            id: '1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: additionalImageUrls,
            categoryName: 'Electronics',
            subCategoryName: null,
        };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        uploadImage.mockResolvedValue('https://example.com/main.jpg');
        uploadMultipleImages.mockResolvedValue(additionalImageUrls);
        productRepository.create.mockResolvedValue(mockProduct);

        const result = await useCase(productData, mainImageFile, additionalImagesFiles);

        expect(uploadImage).toHaveBeenCalledWith(mainImageFile, {
            folder: 'products',
            prefix: 'main',
        });
        expect(uploadMultipleImages).toHaveBeenCalledWith(additionalImagesFiles, {
            folder: 'products',
            prefix: 'gallery',
        });
        expect(result).toEqual(createProductResponseDTO(mockProduct));

        expect(log.debug).toHaveBeenCalledWith('Uploading additional images', { count: 2 });
    });

    it('should create a product with valid subcategory', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            subCategoryId: 'sub1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const mockProduct = {
            ...productData,
            id: '1',
            mainImageUrl: 'https://example.com/main.jpg',
            imageUrls: [],
            categoryName: 'Electronics',
            subCategoryName: 'Smartphones',
        };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        const mockSubCategory = {
            id: 'sub1',
            name: 'Smartphones',
            isActive: true,
            parent: 'cat1',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById
            .mockResolvedValueOnce(mockCategory)
            .mockResolvedValueOnce(mockSubCategory);
        uploadImage.mockResolvedValue('https://example.com/main.jpg');
        productRepository.create.mockResolvedValue(mockProduct);

        const result = await useCase(productData, mainImageFile);

        expect(categoryRepository.findById).toHaveBeenCalledWith('sub1');
        expect(productRepository.create).toHaveBeenCalledWith(
            createCreateProductDTO({
                ...productData,
                mainImageUrl: 'https://example.com/main.jpg',
                imageUrls: [],
                categoryName: 'Electronics',
                subCategoryName: 'Smartphones',
            }),
        );
        expect(result).toEqual(createProductResponseDTO(mockProduct));

        expect(log.debug).toHaveBeenCalledWith('Validating subcategory', { subCategoryId: 'sub1' });
    });

    it('should limit additional images to 5', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const additionalImagesFiles = Array.from({ length: 7 }, (_, i) => ({
            filename: `img${i}.jpg`,
        }));

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        uploadImage.mockResolvedValue('https://example.com/main.jpg');
        uploadMultipleImages.mockResolvedValue([]);
        productRepository.create.mockResolvedValue({});

        await useCase(productData, mainImageFile, additionalImagesFiles);

        expect(uploadMultipleImages).toHaveBeenCalledWith(additionalImagesFiles.slice(0, 5), {
            folder: 'products',
            prefix: 'gallery',
        });
        expect(log.debug).toHaveBeenCalledWith('Uploading additional images', { count: 5 });
    });

    it('should throw an error if main image is not provided', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        await expect(useCase(productData, null)).rejects.toThrow('Main product image is required');

        expect(log.warn).toHaveBeenCalledWith('Product creation failed: Main image not provided');
    });

    it('should throw an error if storeId is not provided', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Store ID is required. Products must be associated with a store.',
        );

        expect(log.warn).toHaveBeenCalledWith('Product creation failed: Store ID not provided');
    });

    it('should throw an error if categoryId is not provided', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Category ID is required. Products must be associated with a category.',
        );

        expect(log.warn).toHaveBeenCalledWith('Product creation failed: Category ID not provided');
    });

    it('should throw an error if store not found', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        storeRepository.findById.mockResolvedValue(null);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow('Store not found.');

        expect(log.warn).toHaveBeenCalledWith('Store not found', { storeId: 'store1' });
    });

    it('should throw an error if store does not belong to seller', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        const mockStore = {
            id: 'store1',
            userId: 'different-seller',
            status: 'Approved',
        };

        storeRepository.findById.mockResolvedValue(mockStore);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'You can only create products for your own stores.',
        );

        expect(log.warn).toHaveBeenCalledWith('Store ownership validation failed', {
            storeUserId: 'different-seller',
            sellerId: 'seller1',
        });
    });

    it('should throw an error if store is not approved', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Pending',
        };

        storeRepository.findById.mockResolvedValue(mockStore);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Cannot create products for a store with status: Pending. Store must be Approved.',
        );

        expect(log.warn).toHaveBeenCalledWith('Store not approved', {
            storeId: 'store1',
            status: 'Pending',
        });
    });

    it('should throw an error if category not found', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(null);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Category not found or inactive.',
        );

        expect(log.warn).toHaveBeenCalledWith('Category not found or inactive', {
            categoryId: 'cat1',
        });
    });

    it('should throw an error if subcategory does not belong to category', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            subCategoryId: 'sub1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        const mockSubCategory = {
            id: 'sub1',
            name: 'Smartphones',
            isActive: true,
            parent: 'different-category',
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById
            .mockResolvedValueOnce(mockCategory)
            .mockResolvedValueOnce(mockSubCategory);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Subcategory does not belong to the selected category.',
        );

        expect(log.warn).toHaveBeenCalledWith('Subcategory does not belong to category', {
            subCategoryId: 'sub1',
            categoryId: 'cat1',
            subCategoryParent: 'different-category',
        });
    });

    it('should handle image upload errors', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const error = new Error('Upload failed');

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        uploadImage.mockRejectedValue(error);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Failed to create product: Upload failed',
        );

        expect(log.error).toHaveBeenCalledWith(
            'Error in createProductUseCase',
            expect.objectContaining({
                error: 'Upload failed',
            }),
        );
    });

    it('should handle repository errors', async () => {
        const productData = {
            name: 'Test Product',
            description: 'A product for testing',
            price: 100,
            stock: 10,
            categoryId: 'cat1',
            sellerId: 'seller1',
            storeId: 'store1',
        };

        const mainImageFile = { filename: 'main.jpg' };
        const error = new Error('DB error');

        const mockStore = {
            id: 'store1',
            userId: 'seller1',
            status: 'Approved',
        };

        const mockCategory = {
            id: 'cat1',
            name: 'Electronics',
            isActive: true,
        };

        storeRepository.findById.mockResolvedValue(mockStore);
        categoryRepository.findById.mockResolvedValue(mockCategory);
        uploadImage.mockResolvedValue('https://example.com/main.jpg');
        productRepository.create.mockRejectedValue(error);

        await expect(useCase(productData, mainImageFile)).rejects.toThrow(
            'Failed to create product: DB error',
        );

        expect(log.error).toHaveBeenCalledWith(
            'Error in createProductUseCase',
            expect.objectContaining({
                error: 'DB error',
            }),
        );
    });
});
