import { createProductResponseDTO } from '../../dtos/products/index.js';
import { cacheManager, CACHE_TTL } from '../../../infrastructure/cache/cacheManager.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Use case for retrieving a single product by its ID or slug.
 * @param {object} productRepository - The repository for product data.
 * @returns {Function} A function to execute the use case.
 */
export const getProductByIdUseCase =
    (productRepository) =>
    /**
     * Executes the get product by ID or slug use case.
     * @param {string} idOrSlug - The product ID or slug to retrieve.
     * @returns {Promise<object|null>} The product DTO or null if not found.
     */
    async (idOrSlug) => {
        const cacheKey = `product:${idOrSlug}`;
        const cached = cacheManager.get(cacheKey);
        if (cached !== null) {
            log.debug('Product fetched from cache', { cacheKey });
            return cached;
        }

        const product = await productRepository.findByIdOrSlug(idOrSlug);
        if (!product) {
            return null;
        }

        const productDTO = createProductResponseDTO(product);
        cacheManager.set(cacheKey, productDTO, CACHE_TTL.PRODUCTS);

        return productDTO;
    };
