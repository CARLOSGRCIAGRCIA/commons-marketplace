import { createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for retrieving all approved stores (public endpoint).
 * @param {object} storeRepository - The repository for store data.
 * @returns {function(): Promise<Array<object>>} A function to execute the use case.
 */
export const getAllStoresUseCase = (storeRepository) => async () => {
    const stores = await storeRepository.findAll();
    return stores.map((store) => createStoreResponseDTO(store));
};
