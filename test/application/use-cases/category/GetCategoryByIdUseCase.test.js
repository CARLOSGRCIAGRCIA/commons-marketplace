import { getCategoryByIdUseCase } from '../../../../src/application/use-cases/category/GetCategoryByIdUseCase.js';
import { categoryResponseDTO } from '../../../../src/application/dtos/categories/index.js';

describe('GetCategoryByIdUseCase Tests', () => {
    let useCase;
    let categoryRepository;

    beforeEach(() => {
        categoryRepository = {
            findById: jest.fn(),
        };
        useCase = getCategoryByIdUseCase(categoryRepository);
    });

    it('should return a category if found', async () => {
        const mockCategory = {
            id: '1',
            name: 'Electronics',
            description: 'Gadgets and devices',
            slug: 'electronics',
            level: 0,
        };
        categoryRepository.findById.mockResolvedValue(mockCategory);

        const result = await useCase('1');

        expect(categoryRepository.findById).toHaveBeenCalledWith('1');
        expect(result).toEqual(categoryResponseDTO(mockCategory));
    });

    it('should return null if the category is not found', async () => {
        categoryRepository.findById.mockResolvedValue(null);

        const result = await useCase('1');

        expect(categoryRepository.findById).toHaveBeenCalledWith('1');
        expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        categoryRepository.findById.mockRejectedValue(error);

        await expect(useCase('1')).rejects.toThrow(error);
    });
});
