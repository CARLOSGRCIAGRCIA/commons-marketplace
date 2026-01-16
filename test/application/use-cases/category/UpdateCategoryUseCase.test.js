import { updateCategoryUseCase } from '../../../../src/application/use-cases/category/UpdateCategoryUseCase.js';
import {
    updateCategoryDTO,
    categoryResponseDTO,
} from '../../../../src/application/dtos/categories/index.js';

describe('UpdateCategoryUseCase Tests', () => {
    let useCase;
    let categoryRepository;

    beforeEach(() => {
        categoryRepository = {
            updateById: jest.fn(),
        };
        useCase = updateCategoryUseCase(categoryRepository);
    });

    it('should update a category and return it', async () => {
        const categoryId = '1';
        const updateData = {
            name: 'Updated Electronics',
            description: 'Updated gadgets and devices',
        };

        const mockUpdatedCategory = {
            id: categoryId,
            ...updateData,
            slug: 'updated-electronics',
            level: 0,
        };

        categoryRepository.updateById.mockResolvedValue(mockUpdatedCategory);

        const result = await useCase(categoryId, updateData);

        expect(categoryRepository.updateById).toHaveBeenCalledWith(
            categoryId,
            updateCategoryDTO(updateData),
        );
        expect(result).toEqual(categoryResponseDTO(mockUpdatedCategory));
    });

    it('should return null if the category to update is not found', async () => {
        const categoryId = '1';
        const updateData = {
            name: 'Updated Electronics',
            description: 'Updated gadgets and devices',
        };

        categoryRepository.updateById.mockResolvedValue(null);

        const result = await useCase(categoryId, updateData);

        expect(categoryRepository.updateById).toHaveBeenCalledWith(
            categoryId,
            updateCategoryDTO(updateData),
        );
        expect(result).toBeNull();
    });

    it('should throw error when no fields are provided for update', async () => {
        const categoryId = '1';
        const updateData = {};

        await expect(useCase(categoryId, updateData)).rejects.toThrow(
            'At least one field must be provided for update',
        );
    });

    it('should handle repository errors', async () => {
        const categoryId = '1';
        const updateData = {
            name: 'Updated Electronics',
            description: 'Updated gadgets and devices',
        };

        const error = new Error('DB error');
        categoryRepository.updateById.mockRejectedValue(error);

        await expect(useCase(categoryId, updateData)).rejects.toThrow(error);
    });

    it('should update with partial data', async () => {
        const categoryId = '1';
        const updateData = {
            name: 'Updated Electronics Only',
        };

        const mockUpdatedCategory = {
            id: categoryId,
            name: 'Updated Electronics Only',
            description: 'Original description',
            slug: 'updated-electronics-only',
            level: 0,
        };

        categoryRepository.updateById.mockResolvedValue(mockUpdatedCategory);

        const result = await useCase(categoryId, updateData);

        expect(categoryRepository.updateById).toHaveBeenCalledWith(
            categoryId,
            updateCategoryDTO(updateData),
        );
        expect(result).toEqual(categoryResponseDTO(mockUpdatedCategory));
    });
});
