import { deleteCategoryUseCase } from '../../../../src/application/use-cases/category/DeleteCategoryUseCase.js';
import { categoryResponseDTO } from '../../../../src/application/dtos/categories/index.js';

describe('DeleteCategoryUseCase Tests', () => {
    let useCase;
    let categoryRepository;

    beforeEach(() => {
        categoryRepository = {
            deleteById: jest.fn(),
        };
        useCase = deleteCategoryUseCase(categoryRepository);
    });

    it('should delete a category and return it', async () => {
        const mockCategory = {
            id: '1',
            name: 'Electronics',
            description: 'Gadgets and devices',
            slug: 'electronics',
            level: 0,
        };
        categoryRepository.deleteById.mockResolvedValue(mockCategory);

        const result = await useCase('1');

        expect(categoryRepository.deleteById).toHaveBeenCalledWith('1');
        expect(result).toEqual(categoryResponseDTO(mockCategory));
    });

    it('should return null if the category to delete is not found', async () => {
        categoryRepository.deleteById.mockResolvedValue(null);

        const result = await useCase('1');

        expect(categoryRepository.deleteById).toHaveBeenCalledWith('1');
        expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        categoryRepository.deleteById.mockRejectedValue(error);

        await expect(useCase('1')).rejects.toThrow(error);
    });
});
