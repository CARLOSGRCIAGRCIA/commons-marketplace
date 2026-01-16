import { categoryResponseDTO } from '../../dtos/categories/index.js';

export const deleteCategoryUseCase = (categoryRepository) => async (id) => {
    const deletedCategory = await categoryRepository.deleteById(id);
    if (!deletedCategory) {
        return null;
    }
    return categoryResponseDTO(deletedCategory);
};
