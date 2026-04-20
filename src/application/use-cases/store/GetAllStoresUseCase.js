import { createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for retrieving all approved stores (public endpoint).
 * Optional filter by categoryId.
 * @param {object} storeRepository - The repository for store data.
 * @returns {function(object): Promise<Array<object>>} A function to execute the use case.
 */
export const getAllStoresUseCase = (storeRepository) => async (filters = {}) => {
    let stores;
    if (filters.categoryId) {
        stores = await storeRepository.findByCategoryId(filters.categoryId);
    } else {
        stores = await storeRepository.findAll();
    }
    return stores.map((store) => createStoreResponseDTO(store));
};
