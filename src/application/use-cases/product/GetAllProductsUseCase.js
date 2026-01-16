import { createProductResponseDTO } from '../../dtos/products/ProductResponseDTO.js';
import { log } from '../../../infrastructure/logger/logger.js';

/**
 * Factory function to create the getAllProducts use case.
 * @param {object} productRepository - The product repository.
 * @returns {Function} The getAllProducts use case function.
 */
export function getAllProductsUseCase(productRepository) {
    /**
     * Get all products with optional filters and pagination.
     * @param {object} filters - Optional filters (storeId, categoryId, subCategoryId, status, etc.)
     * @param {object} options - Pagination options { page, limit }
     * @param {object} sort - Sort options { field: 1 or -1 }
     * @returns {Promise<object>} Paginated result with products as DTOs
     */
    return async function getAllProducts(
        filters = {},
        options = { page: 1, limit: 10 },
        sort = {},
    ) {
        try {
            log.debug('Fetching all products', {
                filters,
                page: options.page,
                limit: options.limit,
                sort,
            });

            const cleanFilters = {};

            if (filters.storeId) cleanFilters.storeId = filters.storeId;
            if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
            if (filters.subCategoryId) cleanFilters.subCategoryId = filters.subCategoryId;
            if (filters.status) cleanFilters.status = filters.status;

            log.debug('Applied filters', { cleanFilters });

            const result = await productRepository.findAll(cleanFilters, options, sort);

            const productsDTO = result.data.map((product) => createProductResponseDTO(product));

            log.info('Products fetched successfully', {
                totalItems: result.totalItems,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                productsCount: productsDTO.length,
            });

            return {
                products: productsDTO,
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    itemsPerPage: options.limit,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                },
            };
        } catch (error) {
            log.error('Error in getAllProducts use case', {
                error: error.message,
                stack: error.stack,
                filters,
                options,
            });
            throw error;
        }
    };
}
