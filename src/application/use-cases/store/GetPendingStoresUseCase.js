import { createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for retrieving all pending stores (admin only).
 * @param {object} storeRepository - The repository for store data.
 * @returns {function(): Promise<Array<object>>} A function to execute the use case.
 */
export const getPendingStoresUseCase = (storeRepository) => async () => {
    const stores = await storeRepository.findAllPending();
    return stores.map((store) => createStoreResponseDTO(store));
};
