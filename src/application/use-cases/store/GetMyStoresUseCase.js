import { createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for retrieving all stores owned by a user.
 * @param {object} storeRepository - The repository for store data.
 * @returns {function(string): Promise<Array<object>>} A function to execute the use case.
 */
export const getMyStoresUseCase = (storeRepository) => async (userId) => {
    if (!userId) {
        throw new Error('User ID is required.');
    }

    const stores = await storeRepository.findAllByUserId(userId);
    return stores.map((store) => createStoreResponseDTO(store));
};
