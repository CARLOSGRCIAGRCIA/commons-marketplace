import { categoryResponseDTO } from '../../dtos/categories/index.js';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';

export const getSubcategoriesUseCase = (categoryRepository) => async (parentId) => {
    if (!parentId) {
        throw new Error('Parent category ID is required');
    }

    const cacheKey = CACHE_KEYS.SUBCATEGORIES + parentId;
    const cached = cacheManager.get(cacheKey);
    if (cached !== null) {
        return cached;
    }

    const categories = await categoryRepository.findSubcategories(parentId);
    const result = categories.map((category) => categoryResponseDTO(category));

    cacheManager.set(cacheKey, result, CACHE_TTL.SUBCATEGORIES);

    return result;
};
