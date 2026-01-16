import { createStoreResponseDTO } from '../../dtos/stores/index.js';
import { IStoreRepository } from '../../../core/repositories/IStoreRepository.js';

/** @typedef {import('../../../core/repositories/IStoreRepository').IStoreRepository} IStoreRepository */

/**
 * Use case for retrieving a store by its owner's user ID.
 * @param {IStoreRepository} storeRepository - The repository for store data.
 * @returns {function(string): Promise<object|null>} A function to execute the use case.
 */
export const getStoreByUserIdUseCase = (storeRepository) => async (userId) => {
    if (!userId) {
        throw new Error('User ID is required.');
    }

    const store = await storeRepository.findByUserId(userId);
    return createStoreResponseDTO(store);
};
