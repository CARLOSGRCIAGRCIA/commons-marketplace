import { categoryResponseDTO } from '../../dtos/categories/index.js';

export const getMainCategoriesUseCase = (categoryRepository) => async () => {
    const categories = await categoryRepository.findMainCategories();
    return categories.map((category) => categoryResponseDTO(category));
};
