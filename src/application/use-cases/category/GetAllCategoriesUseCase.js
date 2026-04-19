import { categoryResponseDTO } from '../../dtos/categories/index.js';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';

export const getAllCategoriesUseCase = (categoryRepository) => async () => {
    const cached = cacheManager.get(CACHE_KEYS.CATEGORIES);
    if (cached !== null) {
        return cached;
    }

    const categories = await categoryRepository.findAll();
    const result = categories.map((category) => categoryResponseDTO(category));

    cacheManager.set(CACHE_KEYS.CATEGORIES, result, CACHE_TTL.CATEGORIES);

    return result;
};
