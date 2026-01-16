import { categoryResponseDTO } from '../../dtos/categories/index.js';

export const getAllCategoriesUseCase = (categoryRepository) => async () => {
    const categories = await categoryRepository.findAll();
    return categories.map((category) => categoryResponseDTO(category));
};
