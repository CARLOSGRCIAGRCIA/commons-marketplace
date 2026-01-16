import { createProductResponseDTO } from '../../dtos/products/index.js';
import { PaginationResponseDTO } from '../../dtos/shared/PaginationResponseDTO.js';

/**
 * Use case for retrieving all products from a specific store.
 * @param {object} productRepository - The repository for product data.
 * @param {object} storeRepository - The repository for store data.
 * @returns {Function} A function to execute the use case.
 */
export const getStoreProductsUseCase =
    (productRepository, storeRepository) =>
    /**
     * Executes the get store products use case.
     * @param {string} storeId - The store ID to get products from.
     * @param {object} [options] - Pagination options.
     * @param {number} options.page - Current page number.
     * @param {number} options.limit - Items per page.
     * @param {object} [sort] - Sort criteria.
     * @returns {Promise<PaginationResponseDTO>} Paginated product list.
     */
    async (storeId, options = { page: 1, limit: 10 }, sort = {}) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        const { page, limit } = options;

        const result = await productRepository.findByStoreId(storeId, { page, limit }, sort);

        const products = result.data || [];
        const totalItems = result.totalItems || 0;
        const totalPages = Math.ceil(totalItems / limit);
        const productDTOs = products.map(createProductResponseDTO);

        return new PaginationResponseDTO(productDTOs, totalItems, totalPages, page);
    };
