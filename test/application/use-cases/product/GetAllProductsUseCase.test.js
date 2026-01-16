import { getAllProductsUseCase } from '../../../../src/application/use-cases/product/GetAllProductsUseCase.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';
import { jest } from '@jest/globals';

describe('GetAllProductsUseCase Tests', () => {
    let productRepository;
    let useCase;

    beforeEach(() => {
        productRepository = {
            findAll: jest.fn(),
        };
        useCase = getAllProductsUseCase(productRepository);
        jest.clearAllMocks();
    });

    it('should return a paginated list of products', async () => {
        const mockRepositoryResult = {
            data: [
                {
                    id: '1',
                    name: 'Product 1',
                    price: 10,
                    stock: 5,
                    categoryId: 'cat1',
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
                {
                    id: '2',
                    name: 'Product 2',
                    price: 20,
                    stock: 10,
                    categoryId: 'cat2',
                    sellerId: 'seller2',
                    storeId: 'store2',
                    mainImageUrl: 'img2.jpg',
                    status: 'Active',
                    createdAt: '2023-01-02',
                    updatedAt: '2023-01-02',
                },
            ],
            totalItems: 2,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        const result = await useCase({}, { page: 1, limit: 10 });

        expect(productRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10 }, {});
        expect(log.debug).toHaveBeenCalledWith('Fetching all products', expect.any(Object));
        expect(log.info).toHaveBeenCalledWith('Products fetched successfully', expect.any(Object));

        expect(result).toEqual({
            products: [
                {
                    id: '1',
                    name: 'Product 1',
                    price: 10,
                    stock: 5,
                    categoryId: 'cat1',
                    categoryName: undefined,
                    subCategoryId: null,
                    subCategoryName: null,
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    imageUrls: [],
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
                {
                    id: '2',
                    name: 'Product 2',
                    price: 20,
                    stock: 10,
                    categoryId: 'cat2',
                    categoryName: undefined,
                    subCategoryId: null,
                    subCategoryName: null,
                    sellerId: 'seller2',
                    storeId: 'store2',
                    mainImageUrl: 'img2.jpg',
                    imageUrls: [],
                    status: 'Active',
                    createdAt: '2023-01-02',
                    updatedAt: '2023-01-02',
                },
            ],
            pagination: {
                totalItems: 2,
                totalPages: 1,
                currentPage: 1,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: false,
            },
        });
    });

    it('should apply sorting when sort parameter is provided', async () => {
        const mockRepositoryResult = {
            data: [
                {
                    id: '1',
                    name: 'Product A',
                    price: 20,
                    stock: 5,
                    categoryId: 'cat1',
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
                {
                    id: '2',
                    name: 'Product B',
                    price: 10,
                    stock: 10,
                    categoryId: 'cat2',
                    sellerId: 'seller2',
                    storeId: 'store2',
                    mainImageUrl: 'img2.jpg',
                    status: 'Active',
                    createdAt: '2023-01-02',
                    updatedAt: '2023-01-02',
                },
            ],
            totalItems: 2,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        await useCase({}, { page: 1, limit: 10 }, { price: 1 });

        expect(productRepository.findAll).toHaveBeenCalledWith(
            {},
            { page: 1, limit: 10 },
            { price: 1 },
        );
        expect(log.debug).toHaveBeenCalledWith('Fetching all products', {
            filters: {},
            page: 1,
            limit: 10,
            sort: { price: 1 },
        });
    });

    it('should handle multiple valid sort fields', async () => {
        const mockRepositoryResult = {
            data: [
                {
                    id: '1',
                    name: 'Product A',
                    price: 20,
                    stock: 5,
                    categoryId: 'cat1',
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
                {
                    id: '2',
                    name: 'Product B',
                    price: 10,
                    stock: 10,
                    categoryId: 'cat2',
                    sellerId: 'seller2',
                    storeId: 'store2',
                    mainImageUrl: 'img2.jpg',
                    status: 'Active',
                    createdAt: '2023-01-02',
                    updatedAt: '2023-01-02',
                },
            ],
            totalItems: 2,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        await useCase({}, { page: 1, limit: 10 }, { name: 1, price: -1 });

        expect(productRepository.findAll).toHaveBeenCalledWith(
            {},
            { page: 1, limit: 10 },
            { name: 1, price: -1 },
        );
    });

    it('should calculate correct pagination metadata', async () => {
        const mockProducts = Array.from({ length: 10 }, (_, i) => ({
            id: String(i + 1),
            name: `Product ${i + 1}`,
            price: (i + 1) * 10,
            stock: i + 5,
            categoryId: `cat${i + 1}`,
            sellerId: `seller${i + 1}`,
            storeId: `store${i + 1}`,
            mainImageUrl: `img${i + 1}.jpg`,
            status: 'Active',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
        }));

        const mockRepositoryResult = {
            data: mockProducts,
            totalItems: 45,
            totalPages: 5,
            currentPage: 2,
            hasNextPage: true,
            hasPrevPage: true,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        const result = await useCase({}, { page: 2, limit: 10 });

        expect(result.pagination.totalItems).toBe(45);
        expect(result.pagination.totalPages).toBe(5);
        expect(result.pagination.currentPage).toBe(2);
        expect(result.pagination.itemsPerPage).toBe(10);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPrevPage).toBe(true);
        expect(result.products).toHaveLength(10);
    });

    it('should handle filters along with pagination and sorting', async () => {
        const mockRepositoryResult = {
            data: [
                {
                    id: '1',
                    name: 'Product 1',
                    price: 10,
                    stock: 5,
                    categoryId: 'cat1',
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
            ],
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        const filters = { categoryId: '123', sellerId: 'seller456' };
        const result = await useCase(filters, { page: 1, limit: 10 }, { createdAt: -1 });

        expect(productRepository.findAll).toHaveBeenCalledWith(
            {
                categoryId: '123',
            },
            { page: 1, limit: 10 },
            { createdAt: -1 },
        );

        expect(result.products).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
        expect(log.debug).toHaveBeenCalledWith('Applied filters', {
            cleanFilters: { categoryId: '123' },
        });
    });

    it('should handle empty results', async () => {
        const mockRepositoryResult = {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        const result = await useCase({}, { page: 1, limit: 10 });

        expect(result.products).toEqual([]);
        expect(result.pagination.totalItems).toBe(0);
        expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        productRepository.findAll.mockRejectedValue(error);

        await expect(useCase({}, { page: 1, limit: 10 })).rejects.toThrow(error);
        expect(log.error).toHaveBeenCalledWith(
            'Error in getAllProducts use case',
            expect.any(Object),
        );
    });

    it('should clean filters and only pass valid ones', async () => {
        const mockRepositoryResult = {
            data: [
                {
                    id: '1',
                    name: 'Product 1',
                    price: 10,
                    stock: 5,
                    categoryId: 'cat1',
                    sellerId: 'seller1',
                    storeId: 'store1',
                    mainImageUrl: 'img1.jpg',
                    status: 'Active',
                    createdAt: '2023-01-01',
                    updatedAt: '2023-01-01',
                },
            ],
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        productRepository.findAll.mockResolvedValue(mockRepositoryResult);

        const filters = {
            storeId: 'store123',
            categoryId: 'cat456',
            subCategoryId: 'sub789',
            status: 'Active',
            invalidField: 'should-be-ignored',
        };

        await useCase(filters, { page: 1, limit: 10 });

        expect(productRepository.findAll).toHaveBeenCalledWith(
            {
                storeId: 'store123',
                categoryId: 'cat456',
                subCategoryId: 'sub789',
                status: 'Active',
            },
            { page: 1, limit: 10 },
            {},
        );
    });
});
