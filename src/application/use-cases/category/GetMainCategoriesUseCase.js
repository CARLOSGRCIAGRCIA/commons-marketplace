import { categoryResponseDTO } from '../../dtos/categories/index.js';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';

export const getMainCategoriesUseCase = (categoryRepository) => async () => {
    const cached = cacheManager.get(CACHE_KEYS.MAIN_CATEGORIES);
    if (cached !== null) {
        return cached;
    }

    const categories = await categoryRepository.findMainCategories();
    const result = categories.map((category) => categoryResponseDTO(category));

    cacheManager.set(CACHE_KEYS.MAIN_CATEGORIES, result, CACHE_TTL.MAIN_CATEGORIES);

    return result;
};
