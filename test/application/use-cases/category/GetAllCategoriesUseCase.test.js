import { getAllCategoriesUseCase } from '../../../../src/application/use-cases/category/GetAllCategoriesUseCase.js';
import { categoryResponseDTO } from '../../../../src/application/dtos/categories/index.js';

describe('GetAllCategoriesUseCase Tests', () => {
    let useCase;
    let categoryRepository;

    beforeEach(() => {
        categoryRepository = {
            findAll: jest.fn(),
        };
        useCase = getAllCategoriesUseCase(categoryRepository);
    });

    it('should return all categories', async () => {
        const mockCategories = [
            {
                id: '1',
                name: 'Electronics',
                description: 'Gadgets and devices',
                slug: 'electronics',
                level: 0,
            },
            {
                id: '2',
                name: 'Books',
                description: 'Books and magazines',
                slug: 'books',
                level: 0,
            },
        ];
        categoryRepository.findAll.mockResolvedValue(mockCategories);

        const result = await useCase();

        expect(categoryRepository.findAll).toHaveBeenCalled();
        expect(result).toEqual(mockCategories.map((category) => categoryResponseDTO(category)));
    });

    it('should return an empty array if no categories are found', async () => {
        categoryRepository.findAll.mockResolvedValue([]);

        const result = await useCase();

        expect(categoryRepository.findAll).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
        const error = new Error('DB error');
        categoryRepository.findAll.mockRejectedValue(error);

        await expect(useCase()).rejects.toThrow(error);
    });
});
