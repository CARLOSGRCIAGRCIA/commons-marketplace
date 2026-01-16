import { createProductResponseDTO } from '../../dtos/products/index.js';

/**
 * Use case for retrieving a single product by its ID.
 * @param {object} productRepository - The repository for product data.
 * @returns {Function} A function to execute the use case.
 */
export const getProductByIdUseCase =
    (productRepository) =>
    /**
     * Executes the get product by ID use case.
     * @param {string} productId - The product ID to retrieve.
     * @returns {Promise<object|null>} The product DTO or null if not found.
     */
    async (productId) => {
        const product = await productRepository.findById(productId);
        return createProductResponseDTO(product);
    };
