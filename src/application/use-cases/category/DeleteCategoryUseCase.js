import { categoryResponseDTO } from '../../dtos/categories/index.js';
import { invalidateCache } from '../../../infrastructure/cache/cacheManager.js';

export const deleteCategoryUseCase = (categoryRepository) => async (id) => {
    const deletedCategory = await categoryRepository.deleteById(id);
    if (!deletedCategory) {
        return null;
    }

    invalidateCache('categories');

    return categoryResponseDTO(deletedCategory);
};
