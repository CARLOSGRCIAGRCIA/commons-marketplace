import { createStoreResponseDTO } from '../../dtos/stores/StoreResponseDTO.js';
import { cacheManager, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case to get a store by its ID or slug.
 * @param {object} storeRepository - The store repository.
 * @returns {Function} A function that retrieves a store by ID or slug.
 */
export function getStoreByIdUseCase(storeRepository) {
    /**
     * Retrieves a store by its ID or slug.
     * @param {string} idOrSlug - The ID or slug of the store to retrieve.
     * @returns {Promise<object|null>} The store DTO or null if not found.
     * @throws {Error} If idOrSlug is not provided.
     */
    return async function execute(idOrSlug) {
        if (!idOrSlug) {
            throw new Error('Store ID or slug is required.');
        }

        const cacheKey = `store:${idOrSlug}`;
        const cached = cacheManager.get(cacheKey);
        if (cached !== null) {
            log.debug('Store fetched from cache', { cacheKey });
            return cached;
        }

        const store = await storeRepository.findByIdOrSlug(idOrSlug);

        if (!store) {
            return null;
        }

        const storeDTO = createStoreResponseDTO(store);
        cacheManager.set(cacheKey, storeDTO, CACHE_TTL.STORE_PRODUCTS);

        return storeDTO;
    };
}
