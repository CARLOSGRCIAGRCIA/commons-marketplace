import { createCategoryUseCase } from '../../../../src/application/use-cases/category/CreateCategoryUseCase.js';
import {
    createCategoryDTO,
    categoryResponseDTO,
} from '../../../../src/application/dtos/categories/index.js';
import { badRequestException } from '../../../../src/presentation/exceptions/badRequestException.js';

describe('CreateCategoryUseCase Tests', () => {
    let useCase;
    let categoryRepository;

    beforeEach(() => {
        categoryRepository = {
            findBySlug: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
        };
        useCase = createCategoryUseCase(categoryRepository);
    });

    it('should create a category and return it', async () => {
        const categoryData = {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Gadgets and devices',
        };

        categoryRepository.findBySlug.mockResolvedValue(null);
        categoryRepository.findById.mockResolvedValue(null);
        categoryRepository.create.mockResolvedValue({
            id: '1',
            ...categoryData,
            level: 0,
        });

        const result = await useCase(categoryData);

        expect(categoryRepository.findBySlug).toHaveBeenCalledWith('electronics');
        expect(categoryRepository.create).toHaveBeenCalledWith(createCategoryDTO(categoryData));
        expect(result).toEqual(
            categoryResponseDTO({
                id: '1',
                ...categoryData,
                level: 0,
            }),
        );
    });

    it('should create a subcategory when valid parent is provided', async () => {
        const categoryData = {
            name: 'Smartphones',
            slug: 'smartphones',
            parent: 'parent-id',
        };

        const parentCategory = {
            id: 'parent-id',
            name: 'Electronics',
            level: 0,
        };

        categoryRepository.findBySlug.mockResolvedValue(null);
        categoryRepository.findById.mockResolvedValue(parentCategory);
        categoryRepository.create.mockResolvedValue({
            id: '2',
            ...categoryData,
            level: 1,
        });

        await useCase(categoryData);

        expect(categoryRepository.findById).toHaveBeenCalledWith('parent-id');
        expect(categoryRepository.create).toHaveBeenCalledWith(
            createCategoryDTO({ ...categoryData, level: 1 }),
        );
    });

    it('should throw badRequestException if name is not provided', async () => {
        const invalidData = { slug: 'electronics' };

        await expect(useCase(invalidData)).rejects.toThrow(
            badRequestException('Category name and slug are required'),
        );
    });

    it('should throw badRequestException if slug is not provided', async () => {
        const invalidData = { name: 'Electronics' };

        await expect(useCase(invalidData)).rejects.toThrow(
            badRequestException('Category name and slug are required'),
        );
    });

    it('should throw badRequestException if category with slug already exists', async () => {
        const categoryData = {
            name: 'Electronics',
            slug: 'electronics',
        };

        categoryRepository.findBySlug.mockResolvedValue({
            id: 'existing-id',
            name: 'Existing Electronics',
            slug: 'electronics',
        });

        await expect(useCase(categoryData)).rejects.toThrow(
            badRequestException('Category with this slug already exists'),
        );
    });

    it('should throw badRequestException if parent category not found', async () => {
        const categoryData = {
            name: 'Smartphones',
            slug: 'smartphones',
            parent: 'non-existent-id',
        };

        categoryRepository.findBySlug.mockResolvedValue(null);
        categoryRepository.findById.mockResolvedValue(null);

        await expect(useCase(categoryData)).rejects.toThrow(
            badRequestException('Parent category not found'),
        );
    });

    it('should throw badRequestException when trying to create subcategory of another subcategory', async () => {
        const categoryData = {
            name: 'Sub Sub Category',
            slug: 'sub-sub-category',
            parent: 'subcategory-id',
        };

        const parentSubCategory = {
            id: 'subcategory-id',
            name: 'Sub Category',
            level: 1,
        };

        categoryRepository.findBySlug.mockResolvedValue(null);
        categoryRepository.findById.mockResolvedValue(parentSubCategory);

        await expect(useCase(categoryData)).rejects.toThrow(
            badRequestException('Cannot create subcategory of another subcategory'),
        );
    });

    it('should handle repository errors', async () => {
        const categoryData = {
            name: 'Electronics',
            slug: 'electronics',
        };

        categoryRepository.findBySlug.mockResolvedValue(null);
        categoryRepository.findById.mockResolvedValue(null);

        const error = new Error('DB error');
        categoryRepository.create.mockRejectedValue(error);

        await expect(useCase(categoryData)).rejects.toThrow(error);
    });
});
