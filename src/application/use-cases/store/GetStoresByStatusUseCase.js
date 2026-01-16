import { createStoreResponseDTO } from '../../dtos/stores/index.js';

/**
 * Use case for retrieving stores by status (admin only).
 * @param {object} storeRepository - The repository for store data.
 * @returns {function(string): Promise<Array<object>>} A function to execute the use case.
 */
export const getStoresByStatusUseCase = (storeRepository) => async (status) => {
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];

    if (!status || !validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const stores = await storeRepository.findAllByStatus(status);
    return stores.map((store) => createStoreResponseDTO(store));
};
