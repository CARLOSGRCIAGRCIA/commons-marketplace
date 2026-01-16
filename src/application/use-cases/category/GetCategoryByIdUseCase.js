import { categoryResponseDTO } from '../../dtos/categories/index.js';

export const getCategoryByIdUseCase = (categoryRepository) => async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        return null;
    }
    return categoryResponseDTO(category);
};
