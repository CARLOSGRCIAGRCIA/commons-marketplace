import { createStoreResponseDTO } from '../../dtos/stores/StoreResponseDTO.js';

/**
 * Use case to get a store by its ID.
 * @param {object} storeRepository - The store repository.
 * @returns {Function} A function that retrieves a store by ID.
 */
export function getStoreByIdUseCase(storeRepository) {
    /**
     * Retrieves a store by its ID.
     * @param {string} storeId - The ID of the store to retrieve.
     * @returns {Promise<object|null>} The store DTO or null if not found.
     * @throws {Error} If storeId is not provided.
     */
    return async function execute(storeId) {
        if (!storeId) {
            throw new Error('Store ID is required.');
        }

        const store = await storeRepository.findById(storeId);

        if (!store) {
            return null;
        }

        return createStoreResponseDTO(store);
    };
}
