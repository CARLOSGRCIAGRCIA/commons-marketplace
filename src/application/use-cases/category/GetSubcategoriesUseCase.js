import { categoryResponseDTO } from '../../dtos/categories/index.js';

export const getSubcategoriesUseCase = (categoryRepository) => async (parentId) => {
    if (!parentId) {
        throw new Error('Parent category ID is required');
    }

    const categories = await categoryRepository.findSubcategories(parentId);
    return categories.map((category) => categoryResponseDTO(category));
};
